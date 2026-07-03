import axios from 'axios';

export const scoreBatProvider = {
  name: 'scorebat',
  hasConfig() {
    return true;
  },
  async fetchHighlights() {
    const response = await axios.get('https://www.scorebat.com/video-api/v3/', {
      timeout: Number(process.env.FOOTBALL_TIMEOUT_MS || 12000),
      params: process.env.SCOREBAT_API_TOKEN ? { token: process.env.SCOREBAT_API_TOKEN } : {}
    });
    const videos = (response.data?.response || []).slice(0, 5).map((item) => ({
      title: item.title,
      sourceName: 'ScoreBat',
      sourceUrl: item.matchviewUrl || item.competitionUrl || 'https://www.scorebat.com/',
      publishedAt: item.date ? new Date(item.date) : new Date()
    }));
    return { ok: true, reason: '', videos };
  }
};
