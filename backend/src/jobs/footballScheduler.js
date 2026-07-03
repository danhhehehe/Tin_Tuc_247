import cron from 'node-cron';
import { syncFootballMatches } from '../services/footballService.js';

export function startFootballScheduler() {
  const minutes = Math.max(Number(process.env.FOOTBALL_SYNC_INTERVAL_MINUTES || 15), 5);
  const expression = process.env.FOOTBALL_SYNC_CRON || `*/${minutes} * * * *`;

  cron.schedule(expression, async () => {
    console.log('Football schedule started.');
    try {
      const result = await syncFootballMatches();
      console.log(`[FOOTBALL] ${result.message}`);
    } catch (error) {
      console.error('[FOOTBALL SCHEDULE ERROR]', error.message);
    }
  });

  console.log(`Football sync schedule: ${expression} (${minutes} minutes).`);
}
