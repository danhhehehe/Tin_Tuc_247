import { Router } from 'express';
import { getSyncLogs, getSyncStatus, resetAndSync, runSyncNow } from '../controllers/syncController.js';

const router = Router();

router.get('/status', getSyncStatus);
router.get('/logs', getSyncLogs);
router.post('/run', runSyncNow);
router.post('/reset', resetAndSync);
router.post('/', runSyncNow);

export default router;
