import FootballMatch from '../models/FootballMatch.js';
import { apiFootballProvider } from './footballProviders/apiFootballProvider.js';
import { footballDataProvider } from './footballProviders/footballDataProvider.js';
import { theSportsDbProvider } from './footballProviders/theSportsDbProvider.js';
import { scoreBatProvider } from './footballProviders/scoreBatProvider.js';
import { footballNewsFallbackProvider } from './footballProviders/footballNewsFallbackProvider.js';

const matchProviders = [apiFootballProvider, footballDataProvider, theSportsDbProvider];
let lazyFootballSyncPromise = null;
let lastLazyFootballSyncAt = 0;

function describeError(error) {
  return error?.response?.status
    ? `HTTP ${error.response.status}`
    : error?.code
      ? `${error.code}: ${error.message || 'Network error'}`
      : error?.message || 'Không rõ lỗi';
}

function formatDateInTimezone(date = new Date(), timeZone = process.env.FOOTBALL_TIMEZONE || 'Asia/Ho_Chi_Minh') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function getDateRange(dateQuery = 'today') {
  const timeZone = process.env.FOOTBALL_TIMEZONE || 'Asia/Ho_Chi_Minh';
  let key;
  if (dateQuery && /^\d{4}-\d{2}-\d{2}$/.test(dateQuery)) {
    key = dateQuery;
  } else {
    const offsetDays = dateQuery === 'tomorrow' ? 1 : 0;
    key = formatDateInTimezone(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000), timeZone);
  }

  const start = new Date(`${key}T00:00:00.000+07:00`);
  const end = new Date(`${key}T23:59:59.999+07:00`);
  return { dateFrom: key, start, end };
}

export function getFootballConfigStatus() {
  return {
    provider: process.env.FOOTBALL_PROVIDER || 'auto',
    apiFootballKey: Boolean(process.env.API_FOOTBALL_KEY),
    footballDataKey: Boolean(process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_API_KEY),
    theSportsDbKey: Boolean(process.env.THESPORTSDB_API_KEY) || process.env.THESPORTSDB_DISABLE_PUBLIC !== 'true',
    theSportsDbMode: process.env.THESPORTSDB_API_KEY ? 'configured-key' : 'public-key-fallback',
    scoreBatToken: Boolean(process.env.SCOREBAT_API_TOKEN),
    fallbackToNews: process.env.FOOTBALL_FALLBACK_TO_NEWS !== 'false',
    timezone: process.env.FOOTBALL_TIMEZONE || 'Asia/Ho_Chi_Minh'
  };
}

async function saveMatches(matches = []) {
  let saved = 0;
  for (const match of matches) {
    await FootballMatch.findOneAndUpdate(
      { externalId: match.externalId, provider: match.provider },
      { $set: match },
      { upsert: true, new: true }
    );
    saved += 1;
  }
  return saved;
}

export async function syncFootballMatches() {
  const results = [];
  let totalSaved = 0;

  for (const provider of matchProviders) {
    try {
      const result = await provider.fetch();
      const saved = result.matches?.length ? await saveMatches(result.matches) : 0;
      totalSaved += saved;
      results.push({ provider: provider.name, ok: result.ok, reason: result.reason || '', matches: result.matches?.length || 0, saved });
    } catch (error) {
      const reason = describeError(error);
      console.error(`[FOOTBALL PROVIDER ERROR] ${provider.name}: ${reason}`);
      results.push({ provider: provider.name, ok: false, reason, matches: 0, saved: 0 });
    }
  }

  try {
    const highlights = await scoreBatProvider.fetchHighlights();
    results.push({ provider: scoreBatProvider.name, ok: highlights.ok, reason: highlights.reason || '', highlights: highlights.videos?.length || 0, saved: 0 });
  } catch (error) {
    const reason = describeError(error);
    console.error(`[FOOTBALL PROVIDER ERROR] scorebat: ${reason}`);
    results.push({ provider: 'scorebat', ok: false, reason, highlights: 0, saved: 0 });
  }

  const newsFallback = await footballNewsFallbackProvider.fetchNews();
  results.push({ provider: 'news-fallback', ok: newsFallback.ok, reason: newsFallback.reason || '', news: newsFallback.news?.length || 0, saved: 0 });

  return {
    ok: totalSaved > 0 || newsFallback.ok,
    upserted: totalSaved,
    results,
    message: totalSaved
      ? `Đã cập nhật ${totalSaved} trận bóng đá.`
      : 'Chưa có dữ liệu tỉ số trực tiếp. Đang dùng tin/video bóng đá mới nhất nếu có.'
  };
}

async function maybeLazySyncFootball() {
  const cooldownMs = Math.max(Number(process.env.FOOTBALL_LAZY_SYNC_COOLDOWN_MS || 5 * 60 * 1000), 60 * 1000);
  if (Date.now() - lastLazyFootballSyncAt < cooldownMs) return null;
  if (!lazyFootballSyncPromise) {
    lastLazyFootballSyncAt = Date.now();
    lazyFootballSyncPromise = syncFootballMatches().finally(() => {
      lazyFootballSyncPromise = null;
    });
  }
  return lazyFootballSyncPromise;
}

export async function getFootballMatches({ date = 'today', status = '', warmup = false } = {}) {
  const filter = {};
  if (status) {
    const normalized = String(status).toUpperCase();
    filter.status = normalized === 'LIVE' ? { $in: ['LIVE', 'IN_PLAY', 'PAUSED'] } : normalized;
  } else {
    const { start, end } = getDateRange(date);
    filter.matchTime = { $gte: start, $lte: end };
  }

  let rows = await FootballMatch.find(filter).sort({ matchTime: 1 }).limit(30).lean();
  if (!rows.length && warmup) {
    await maybeLazySyncFootball();
    rows = await FootballMatch.find(filter).sort({ matchTime: 1 }).limit(30).lean();
  }
  return rows;
}

async function getScoreBatFallback(limit = 5) {
  try {
    const result = await scoreBatProvider.fetchHighlights();
    return (result.videos || []).slice(0, limit);
  } catch (error) {
    return [];
  }
}

export async function getFootballWidgetData({ warmup = true } = {}) {
  const [todayInitial, liveInitial, finishedInitial] = await Promise.all([
    getFootballMatches({ date: 'today' }),
    getFootballMatches({ status: 'live' }),
    getFootballMatches({ status: 'finished' })
  ]);

  let today = todayInitial;
  let live = liveInitial;
  let finished = finishedInitial;

  if (warmup && !today.length && !live.length && !finished.length) {
    await maybeLazySyncFootball();
    [today, live, finished] = await Promise.all([
      getFootballMatches({ date: 'today' }),
      getFootballMatches({ status: 'live' }),
      getFootballMatches({ status: 'finished' })
    ]);
  }

  if (today.length || live.length || finished.length) {
    const latest = [...today, ...live, ...finished]
      .map((item) => item.fetchedAt || item.updatedAt || item.createdAt)
      .filter(Boolean)
      .sort()
      .at(-1);
    return {
      success: true,
      mode: 'matches',
      provider: [...today, ...live, ...finished][0]?.provider || 'match-db',
      message: 'Đã tải lịch bóng đá và tỉ số.',
      data: { today, live, finished },
      updatedAt: latest || null,
      config: getFootballConfigStatus()
    };
  }

  const newsResult = await footballNewsFallbackProvider.fetchNews(8);
  if (newsResult.news.length) {
    return {
      success: true,
      mode: 'news-fallback',
      provider: 'article-db',
      message: 'Chưa có dữ liệu tỉ số trực tiếp. Đang hiển thị tin bóng đá mới nhất.',
      data: { today: [], live: [], finished: [], news: newsResult.news },
      updatedAt: newsResult.news[0]?.publishedAt || newsResult.news[0]?.fetchedAt || null,
      config: getFootballConfigStatus()
    };
  }

  const highlights = await getScoreBatFallback(6);
  if (highlights.length) {
    return {
      success: true,
      mode: 'highlights-fallback',
      provider: 'scorebat',
      message: 'Chưa có lịch/tỉ số trong MongoDB. Đang hiển thị video bóng đá nổi bật.',
      data: { today: [], live: [], finished: [], highlights },
      updatedAt: highlights[0]?.publishedAt || null,
      config: getFootballConfigStatus()
    };
  }

  return {
    success: true,
    mode: 'empty',
    provider: 'none',
    message: 'Đang cập nhật dữ liệu bóng đá. Hãy bấm Cập nhật bóng đá hoặc thêm API key để có tỉ số trực tiếp.',
    data: { today: [], live: [], finished: [], news: [], highlights: [] },
    updatedAt: null,
    config: getFootballConfigStatus()
  };
}

export async function getFootballDebugInfo() {
  const config = getFootballConfigStatus();
  const sync = await syncFootballMatches();
  const widget = await getFootballWidgetData({ warmup: false });
  return { config, providerResults: sync.results, matchesFound: sync.upserted, widgetMode: widget.mode, newsFallbackFound: widget.data?.news?.length || 0 };
}
