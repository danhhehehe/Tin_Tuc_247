import axios from 'axios';
import { normalizeFootballMatch, isUsableFootballMatch } from '../../utils/normalizeFootballMatch.js';

export const theSportsDbProvider = {
  name: 'thesportsdb',
  hasConfig() {
    return process.env.THESPORTSDB_DISABLE_PUBLIC !== 'true';
  },
  async fetch() {
    if (!this.hasConfig()) return { ok: false, reason: 'THESPORTSDB_DISABLE_PUBLIC=true', matches: [] };
    const key = process.env.THESPORTSDB_API_KEY || '3';
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.FOOTBALL_TIMEZONE || 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php`, {
      timeout: Number(process.env.FOOTBALL_TIMEOUT_MS || 12000),
      params: { d: today, s: 'Soccer' }
    });
    const matches = (response.data?.events || [])
      .map((item) => normalizeFootballMatch(item, this.name))
      .filter(isUsableFootballMatch);
    return { ok: true, reason: key === '3' ? 'public key fallback' : '', matches };
  }
};
