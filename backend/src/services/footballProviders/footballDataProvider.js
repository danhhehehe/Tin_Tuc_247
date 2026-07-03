import axios from 'axios';
import { normalizeFootballMatch, isUsableFootballMatch } from '../../utils/normalizeFootballMatch.js';

export const footballDataProvider = {
  name: 'football-data',
  hasConfig() {
    return Boolean(process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_API_KEY);
  },
  async fetch() {
    const key = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_API_KEY;
    if (!key) return { ok: false, reason: 'missing FOOTBALL_DATA_API_KEY', matches: [] };
    const today = new Date().toISOString().slice(0, 10);
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      timeout: Number(process.env.FOOTBALL_TIMEOUT_MS || 12000),
      headers: { 'X-Auth-Token': key },
      params: { dateFrom: today, dateTo: today }
    });
    const matches = (response.data?.matches || [])
      .map((item) => normalizeFootballMatch(item, this.name))
      .filter(isUsableFootballMatch);
    return { ok: true, reason: '', matches };
  }
};
