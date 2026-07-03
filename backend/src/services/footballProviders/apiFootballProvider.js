import axios from 'axios';
import { normalizeFootballMatch, isUsableFootballMatch } from '../../utils/normalizeFootballMatch.js';

export const apiFootballProvider = {
  name: 'api-football',
  hasConfig() {
    return Boolean(process.env.API_FOOTBALL_KEY);
  },
  async fetch() {
    if (!this.hasConfig()) return { ok: false, reason: 'missing API_FOOTBALL_KEY', matches: [] };
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      timeout: Number(process.env.FOOTBALL_TIMEOUT_MS || 12000),
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY,
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
      },
      params: { date: new Date().toISOString().slice(0, 10) }
    });
    const matches = (response.data?.response || [])
      .map((item) => normalizeFootballMatch(item, this.name))
      .filter(isUsableFootballMatch);
    return { ok: true, reason: '', matches };
  }
};
