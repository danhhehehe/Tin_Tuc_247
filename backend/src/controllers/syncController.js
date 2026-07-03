import Article from '../models/Article.js';
import FeedSource from '../models/FeedSource.js';
import SyncLog from '../models/SyncLog.js';
import { getActiveSyncInfo, isSyncActive, syncAllFeedsLocked } from '../services/newsSyncService.js';
import { seedDefaultFeeds } from '../services/feedSeeder.js';
import { getNextSyncAt, getSyncIntervalMinutes } from '../services/scheduler.js';

function summarizeSyncResult(result = {}) {
  const failed = result.failedSources ?? result.failed ?? 0;
  return {
    success: true,
    syncing: false,
    message: failed
      ? 'Da cap nhat tin. Mot vai nguon tam thoi chua truy cap duoc va he thong se tu thu lai sau.'
      : 'Da cap nhat tin moi.',
    totalSources: result.totalSources || result.totalFeeds || 0,
    successSources: result.successSources || result.success || 0,
    failedSources: failed,
    inserted: result.inserted || 0,
    updated: result.updated || 0,
    skipped: result.skipped || 0
  };
}

export async function runSyncNow(req, res, next) {
  if (isSyncActive()) {
    return res.status(202).json({
      success: true,
      syncing: true,
      message: 'He thong dang cap nhat tin. Vui long thu lai sau it phut.',
      ...getActiveSyncInfo()
    });
  }

  try {
    const result = await syncAllFeedsLocked();
    res.json(summarizeSyncResult(result));
  } catch (error) {
    next(error);
  }
}

export async function resetAndSync(req, res, next) {
  if (isSyncActive()) {
    return res.status(202).json({
      success: true,
      syncing: true,
      message: 'He thong dang cap nhat tin. Vui long thu lai sau it phut.',
      ...getActiveSyncInfo()
    });
  }

  try {
    await Promise.all([
      Article.deleteMany({}),
      FeedSource.deleteMany({}),
      SyncLog.deleteMany({})
    ]);
    await seedDefaultFeeds();
    const result = await syncAllFeedsLocked();
    res.json({ reset: true, ...summarizeSyncResult(result) });
  } catch (error) {
    next(error);
  }
}

export async function getSyncLogs(req, res, next) {
  try {
    const logs = await SyncLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('startedAt finishedAt totalFeeds inserted updated skipped failed success message createdAt')
      .lean();
    res.json(logs.map((log) => ({
      ...log,
      message: log.failed ? 'Mot vai nguon tin tam thoi chua truy cap duoc.' : log.message
    })));
  } catch (error) {
    next(error);
  }
}

export async function getSyncStatus(req, res, next) {
  try {
    const syncIntervalMinutes = getSyncIntervalMinutes();
    const [articleCount, sourceCount, activeSourceCount, failedSourceCount, latestLog] = await Promise.all([
      Article.countDocuments(),
      FeedSource.countDocuments(),
      FeedSource.countDocuments({ enabled: true, active: { $ne: false } }),
      FeedSource.countDocuments({ lastStatus: 'failed' }),
      SyncLog.findOne().sort({ createdAt: -1 }).lean()
    ]);

    res.json({
      ...getActiveSyncInfo(),
      articleCount,
      sourceCount,
      activeSourceCount,
      failedSourceCount,
      lastSync: latestLog?.finishedAt || latestLog?.startedAt || null,
      nextSync: getNextSyncAt(latestLog?.finishedAt || latestLog?.startedAt || new Date()),
      syncIntervalMinutes,
      lastSyncSuccess: latestLog ? latestLog.failed === 0 : false,
      lastSyncMessage: latestLog?.failed ? 'Mot vai nguon tin tam thoi chua truy cap duoc. He thong se tu thu lai sau.' : '',
      databaseConnected: Article.db.readyState === 1,
      latestLog: latestLog
        ? {
            startedAt: latestLog.startedAt,
            finishedAt: latestLog.finishedAt,
            totalFeeds: latestLog.totalFeeds,
            inserted: latestLog.inserted,
            updated: latestLog.updated,
            skipped: latestLog.skipped,
            failed: latestLog.failed,
            success: latestLog.success,
            message: latestLog.failed ? 'Mot vai nguon tin tam thoi chua truy cap duoc.' : latestLog.message
          }
        : null
    });
  } catch (error) {
    next(error);
  }
}
