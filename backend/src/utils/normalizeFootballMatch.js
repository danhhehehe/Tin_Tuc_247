import { normalizeVietnameseText } from './textNormalize.js';

export function normalizeFootballStatus(status = '') {
  const value = String(status || '').toUpperCase();
  if (['LIVE', 'IN_PLAY', 'PLAYING', '1H', '2H', 'ET', 'BT'].includes(value)) return 'LIVE';
  if (['PAUSED', 'HT', 'HALFTIME'].includes(value)) return 'PAUSED';
  if (['FINISHED', 'FT', 'AET', 'PEN', 'FULL_TIME', 'COMPLETED', 'FINAL'].includes(value)) return 'FINISHED';
  if (['POSTPONED', 'PST'].includes(value)) return 'POSTPONED';
  if (['CANCELED', 'CANCELLED', 'CANC'].includes(value)) return 'CANCELED';
  if (['SCHEDULED', 'TIMED', 'NS'].includes(value)) return value === 'NS' ? 'SCHEDULED' : value;
  return 'UNKNOWN';
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pickString(...values) {
  return values
    .flat()
    .map((value) => {
      if (typeof value === 'string') return value;
      if (value?.name) return value.name;
      if (value?.Name) return value.Name;
      if (value?.shortName) return value.shortName;
      if (value?.displayName) return value.displayName;
      if (value?.teamName) return value.teamName;
      return '';
    })
    .map((value) => normalizeVietnameseText(value))
    .find(Boolean) || '';
}

export function normalizeFootballMatch(raw = {}, provider = 'unknown') {
  if (provider === 'api-football') {
    return {
      externalId: String(raw.fixture?.id || raw.id || ''),
      provider,
      league: pickString(raw.league?.name),
      competitionCode: pickString(raw.league?.id),
      season: pickString(raw.league?.season),
      round: pickString(raw.league?.round),
      homeTeam: pickString(raw.teams?.home?.name),
      awayTeam: pickString(raw.teams?.away?.name),
      homeLogo: raw.teams?.home?.logo || '',
      awayLogo: raw.teams?.away?.logo || '',
      homeScore: asNumber(raw.goals?.home ?? raw.score?.fulltime?.home),
      awayScore: asNumber(raw.goals?.away ?? raw.score?.fulltime?.away),
      status: normalizeFootballStatus(raw.fixture?.status?.short || raw.fixture?.status?.long),
      matchTime: asDate(raw.fixture?.date) || new Date(),
      minute: pickString(raw.fixture?.status?.elapsed),
      venue: pickString(raw.fixture?.venue?.name),
      sourceName: 'API-Football',
      sourceUrl: 'https://www.api-football.com/',
      fetchedAt: new Date()
    };
  }

  if (provider === 'football-data') {
    return {
      externalId: String(raw.id || ''),
      provider,
      league: pickString(raw.competition?.name),
      competitionCode: pickString(raw.competition?.code),
      season: pickString(raw.season?.startDate),
      round: pickString(raw.matchday),
      homeTeam: pickString(raw.homeTeam?.name),
      awayTeam: pickString(raw.awayTeam?.name),
      homeLogo: raw.homeTeam?.crest || '',
      awayLogo: raw.awayTeam?.crest || '',
      homeScore: asNumber(raw.score?.fullTime?.home ?? raw.score?.regularTime?.home),
      awayScore: asNumber(raw.score?.fullTime?.away ?? raw.score?.regularTime?.away),
      status: normalizeFootballStatus(raw.status),
      matchTime: asDate(raw.utcDate) || new Date(),
      minute: '',
      venue: pickString(raw.venue),
      sourceName: 'football-data.org',
      sourceUrl: 'https://www.football-data.org/',
      fetchedAt: new Date()
    };
  }

  if (provider === 'thesportsdb') {
    return {
      externalId: String(raw.idEvent || ''),
      provider,
      league: pickString(raw.strLeague),
      competitionCode: pickString(raw.idLeague),
      season: pickString(raw.strSeason),
      round: pickString(raw.intRound),
      homeTeam: pickString(raw.strHomeTeam),
      awayTeam: pickString(raw.strAwayTeam),
      homeLogo: raw.strHomeTeamBadge || '',
      awayLogo: raw.strAwayTeamBadge || '',
      homeScore: asNumber(raw.intHomeScore),
      awayScore: asNumber(raw.intAwayScore),
      status: normalizeFootballStatus(raw.strStatus || (raw.intHomeScore !== null ? 'FINISHED' : 'SCHEDULED')),
      matchTime: asDate(`${raw.dateEvent || ''}T${raw.strTime || '00:00:00'}`) || new Date(),
      minute: '',
      venue: pickString(raw.strVenue),
      sourceName: 'TheSportsDB',
      sourceUrl: 'https://www.thesportsdb.com/',
      fetchedAt: new Date()
    };
  }

  return {
    externalId: String(raw.externalId || raw.id || ''),
    provider,
    league: pickString(raw.league, raw.competition?.name, raw.tournament?.name),
    competitionCode: pickString(raw.competitionCode),
    season: pickString(raw.season),
    round: pickString(raw.round),
    homeTeam: pickString(raw.homeTeam, raw.home, raw.homeCompetitor),
    awayTeam: pickString(raw.awayTeam, raw.away, raw.awayCompetitor),
    homeLogo: raw.homeLogo || '',
    awayLogo: raw.awayLogo || '',
    homeScore: asNumber(raw.homeScore),
    awayScore: asNumber(raw.awayScore),
    status: normalizeFootballStatus(raw.status),
    matchTime: asDate(raw.matchTime || raw.date || raw.utcDate) || new Date(),
    minute: pickString(raw.minute),
    venue: pickString(raw.venue),
    sourceName: raw.sourceName || provider,
    sourceUrl: raw.sourceUrl || '',
    fetchedAt: new Date()
  };
}

export function isUsableFootballMatch(match = {}) {
  return Boolean(match.externalId && match.provider && match.homeTeam && match.awayTeam && match.matchTime);
}
