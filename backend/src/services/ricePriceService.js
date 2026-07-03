import axios from 'axios';
import { load } from 'cheerio';
import RicePrice from '../models/RicePrice.js';
import { extractRicePricesFromText, isValidRicePriceItem } from '../utils/ricePriceExtractor.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

export const RICE_PRICE_SOURCES = [
  { name: 'AgriJapan', url: 'https://agrijapan.com.vn/gia-lua' },
  { name: 'Vietnam.vn - Giá lúa gạo', url: 'https://www.vietnam.vn/tag/gia-lua-gao/' },
  { name: 'VietnamBiz', url: 'https://vietnambiz.vn/gia-gao.html' },
  { name: 'Nông nghiệp môi trường', url: 'https://nongnghiepmoitruong.vn/gia-lua-tai-dong-thap-tag195603/' },
  { name: 'Thị trường lúa gạo', url: 'https://thitruongluagao.com/' },
  { name: 'Hiệp hội Lương thực Việt Nam', url: 'https://vietfood.org.vn/gao-viet/' },
  { name: 'VFA Export Price', url: 'https://e.vietfood.org.vn/market-update/export-price/' },
  { name: 'Lúa Gạo Việt', url: 'https://luagaoviet.com/' }
];

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36 TinTuc247/1.4',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Referer: 'https://www.google.com/'
};

const REFERENCE_PRICE_DATE = new Date('2026-06-27T07:00:00+07:00');
const REFERENCE_RICE_PRICE_ROWS = [
  ['CL 555', 'gao-nguyen-lieu', 'ĐBSCL', '9.100 đ/kg', 9100, 9100],
  ['IR 50404', 'gao-nguyen-lieu', 'ĐBSCL', '8.700 - 8.800 đ/kg', 8700, 8800],
  ['OM 5451', 'gao-nguyen-lieu', 'ĐBSCL', '9.500 - 9.600 đ/kg', 9500, 9600],
  ['Đài Thơm 8', 'gao-nguyen-lieu', 'ĐBSCL', '9.200 - 9.400 đ/kg', 9200, 9400],
  ['OM 18', 'gao-nguyen-lieu', 'ĐBSCL', '8.700 - 8.850 đ/kg', 8700, 8850],
  ['OM 380', 'gao-nguyen-lieu', 'ĐBSCL', '7.500 - 7.600 đ/kg', 7500, 7600],
  ['Sóc Thơm', 'gao-nguyen-lieu', 'ĐBSCL', '7.500 - 7.600 đ/kg', 7500, 7600],
  ['Gạo thành phẩm IR 50404', 'gao-thanh-pham', 'ĐBSCL', '10.750 - 10.900 đ/kg', 10750, 10900],
  ['Tấm thơm', 'phu-pham', 'ĐBSCL', '7.950 - 8.100 đ/kg', 7950, 8100],
  ['Cám', 'phu-pham', 'ĐBSCL', '7.950 - 8.050 đ/kg', 7950, 8050],
  ['Nàng Nhen', 'gao-thanh-pham', 'ĐBSCL', '28.000 đ/kg', 28000, 28000],
  ['Jasmine', 'gao-thanh-pham', 'ĐBSCL', '22.000 đ/kg', 22000, 22000],
  ['Gạo Nhật', 'gao-thanh-pham', 'ĐBSCL', '22.000 đ/kg', 22000, 22000],
  ['Sóc Thái', 'gao-thanh-pham', 'ĐBSCL', '20.000 - 22.000 đ/kg', 20000, 22000]
];

function getReferenceRicePrices(limit = 30) {
  return REFERENCE_RICE_PRICE_ROWS.map(([variety, group, region, priceText, minPrice, maxPrice]) => ({
    variety,
    group,
    region,
    priceText,
    minPrice,
    maxPrice,
    unit: 'đ/kg',
    changeText: 'Dữ liệu tham khảo khi nguồn trực tuyến chưa phản hồi',
    trend: 'stable',
    sourceName: 'Bảng tham khảo Tin Tức 247',
    sourceUrl: 'https://www.vietnam.vn/en/gia-lua-gao-hom-nay-27-6-2026-gao-xuat-khau-tang-gia',
    priceDate: REFERENCE_PRICE_DATE,
    fetchedAt: new Date(),
    referenceOnly: true
  })).slice(0, Math.min(Math.max(Number(limit) || 30, 1), 30));
}

function cleanDocumentText(html = '') {
  const $ = load(html);
  $('script, style, nav, header, footer, aside, form, noscript, iframe').remove();
  return normalizeVietnameseText($('main, article, .content, .post, .entry, body').text());
}

function extractTableText(html = '') {
  const $ = load(html);
  const lines = [];
  $('table tr').each((_, row) => {
    const cells = $(row)
      .find('th,td')
      .map((__, cell) => normalizeVietnameseText($(cell).text()))
      .get()
      .filter(Boolean);
    if (cells.length) lines.push(cells.join(' | '));
  });
  return lines.join('\n');
}

function getLikelyArticleLinks(html = '', baseUrl = '') {
  const $ = load(html);
  const links = [];

  $('a[href]').each((_, link) => {
    const title = normalizeVietnameseText($(link).text());
    const href = $(link).attr('href');
    if (!href || !/giá|gia|lúa|lua|gạo|gao|rice|export/i.test(`${title} ${href}`)) return;
    try {
      links.push({
        title,
        url: new URL(href, baseUrl).toString()
      });
    } catch {
      // Ignore malformed source links.
    }
  });

  return links
    .filter((item, index, arr) => arr.findIndex((other) => other.url === item.url) === index)
    .slice(0, 5);
}

function normalizeRicePriceDoc(doc = {}) {
  const unit = doc.unit || 'đ/kg';
  const rawPriceText = doc.priceText || '';
  const priceText = /\/kg|\/tấn|\/tan|\/ton|usd/i.test(rawPriceText)
    ? rawPriceText
    : rawPriceText.replace(/\s*đ$/i, ` ${unit}`).trim();

  return {
    ...doc,
    group: doc.group || 'lua-tuoi',
    trend: doc.trend || 'unknown',
    unit,
    priceText,
    priceDate: doc.priceDate || doc.updatedAt || doc.fetchedAt || doc.createdAt || new Date()
  };
}

async function fetchHtml(url) {
  const response = await axios.get(url, {
    timeout: Number(process.env.RICE_PRICE_TIMEOUT_MS || 12000),
    responseType: 'text',
    maxRedirects: 5,
    headers: REQUEST_HEADERS,
    validateStatus: (status) => status >= 200 && status < 400
  });
  return String(response.data || '');
}

async function fetchSource(source) {
  const html = await fetchHtml(source.url);
  const directText = `${extractTableText(html)}\n${cleanDocumentText(html)}`;
  let prices = extractRicePricesFromText(directText, source);
  const samples = [directText.slice(0, 900)];

  const articleLinks = getLikelyArticleLinks(html, source.url);
  for (const link of articleLinks) {
    try {
      const articleHtml = await fetchHtml(link.url);
      const articleText = `${extractTableText(articleHtml)}\n${cleanDocumentText(articleHtml)}`;
      samples.push(articleText.slice(0, 900));
      prices = prices.concat(extractRicePricesFromText(articleText, { ...source, url: link.url }));
    } catch (error) {
      console.warn(`[RICE ARTICLE SKIP] ${source.name} | ${link.url} | ${error.message}`);
    }
  }

  const validPrices = prices.filter(isValidRicePriceItem).slice(0, 60);
  return {
    source,
    ok: true,
    count: validPrices.length,
    prices: validPrices,
    sampleText: samples.find(Boolean) || ''
  };
}

export async function debugRicePriceSources() {
  const results = await Promise.allSettled(RICE_PRICE_SOURCES.map(fetchSource));
  return results.map((result, index) => {
    const source = RICE_PRICE_SOURCES[index];
    if (result.status === 'fulfilled') return result.value;
    return {
      source,
      ok: false,
      count: 0,
      prices: [],
      sampleText: '',
      error: result.reason?.message || 'Không rõ lỗi'
    };
  });
}

export async function getLatestRicePrices(limit = 8) {
  const rows = await RicePrice.aggregate([
    { $match: { priceText: { $regex: /\d/ } } },
    { $sort: { priceDate: -1, fetchedAt: -1, updatedAt: -1 } },
    {
      $group: {
        _id: {
          variety: '$variety',
          region: '$region',
          sourceName: '$sourceName'
        },
        doc: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { priceDate: -1, fetchedAt: -1, variety: 1 } },
    { $limit: Math.min(Math.max(Number(limit) || 8, 1), 30) }
  ]);

  const liveRows = rows.map(normalizeRicePriceDoc).filter(isValidRicePriceItem);
  if (liveRows.length) return liveRows;
  return getReferenceRicePrices(limit);
}

export async function getRicePriceHistory({ variety = '', limit = 30 } = {}) {
  const filter = {};
  if (variety) filter.variety = { $regex: normalizeVietnameseText(variety), $options: 'i' };
  const rows = await RicePrice.find(filter)
    .sort({ priceDate: -1, fetchedAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 30, 1), 100))
    .lean();
  const liveRows = rows.map(normalizeRicePriceDoc).filter(isValidRicePriceItem);
  if (liveRows.length) return liveRows;
  return getReferenceRicePrices(limit).filter((item) => !variety || item.variety.toLowerCase().includes(variety.toLowerCase()));
}

export async function syncRicePrices() {
  const results = await debugRicePriceSources();
  const docs = results.flatMap((result) => result.prices || []).filter(isValidRicePriceItem);

  results.forEach((result) => {
    if (!result.ok) {
      console.error(`[RICE PRICE ERROR] ${result.source.name}: ${result.error}`);
    } else {
      console.log(`[RICE PRICE SOURCE] ${result.source.name}: ${result.count} dòng giá`);
    }
  });

  if (!docs.length) {
    return {
      ok: false,
      inserted: 0,
      updated: 0,
      sourceResults: results,
      message: 'Chưa kéo được bảng giá trực tuyến. Widget đang dùng bảng tham khảo để không bị trống.'
    };
  }

  let saved = 0;
  for (const doc of docs) {
    const priceDate = doc.priceDate ? new Date(doc.priceDate) : new Date();
    await RicePrice.findOneAndUpdate(
      {
        variety: doc.variety,
        region: doc.region,
        sourceName: doc.sourceName,
        priceDate
      },
      { $set: { ...doc, priceDate, fetchedAt: new Date() } },
      { upsert: true, new: true }
    );
    saved += 1;
  }

  return {
    ok: true,
    inserted: saved,
    updated: saved,
    sourceResults: results,
    message: `Đã cập nhật ${saved} dòng giá lúa/gạo.`
  };
}
