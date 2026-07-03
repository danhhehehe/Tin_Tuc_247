import cron from 'node-cron';
import { isSyncActive, syncAllFeedsLocked } from './newsSyncService.js';
import { syncRicePrices } from './ricePriceService.js';

export function getSyncIntervalMinutes() {
  return Math.max(Number(process.env.SYNC_INTERVAL_MINUTES || 30), 1);
}

export function getNextSyncAt(latestSyncDate = new Date()) {
  const base = latestSyncDate ? new Date(latestSyncDate) : new Date();
  return new Date(base.getTime() + getSyncIntervalMinutes() * 60 * 1000);
}

export function startNewsScheduler() {
  const minutes = getSyncIntervalMinutes();
  const expression = process.env.SYNC_CRON || `*/${minutes} * * * *`;

  cron.schedule(expression, async () => {
    if (isSyncActive()) {
      console.log('RSS schedule skipped: a sync is already running.');
      return;
    }

    console.log('RSS schedule started.');
    try {
      const log = await syncAllFeedsLocked();
      console.log(`RSS schedule finished: ${log.message}`);
    } catch (error) {
      console.error('RSS schedule failed:', error.message);
    }
  });

  console.log(`RSS sync schedule: ${expression} (${minutes} minutes).`);
}

export function startMarketScheduler() {
  const minutes = Math.max(Number(process.env.RICE_PRICE_SYNC_INTERVAL_MINUTES || process.env.MARKET_SYNC_INTERVAL_MINUTES || 60), 30);
  const expression = process.env.MARKET_SYNC_CRON || `*/${minutes} * * * *`;

  cron.schedule(expression, async () => {
    console.log('Market widgets schedule started.');
    try {
      const rice = await syncRicePrices();
      console.log(`[RICE] ${rice.message}`);
    } catch (error) {
      console.error('[RICE SCHEDULE ERROR]', error.message);
    }
  });

  console.log(`Rice price sync schedule: ${expression} (${minutes} minutes).`);
}
