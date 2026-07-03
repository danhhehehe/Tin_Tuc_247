import { Router } from 'express';
import {
  getFootballConfigStatus,
  getFootballDebugInfo,
  getFootballMatches,
  getFootballWidgetData,
  syncFootballMatches
} from '../services/footballService.js';

const router = Router();

router.get('/matches', async (req, res, next) => {
  try {
    const data = await getFootballMatches({ ...req.query, warmup: true });
    res.json({
      success: true,
      data,
      message: data.length ? 'Đã tải lịch bóng đá.' : 'Chưa có lịch/tỉ số trong ngày này. Widget sẽ dùng tin bóng đá dự phòng.'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/widget', async (req, res, next) => {
  try {
    res.json(await getFootballWidgetData());
  } catch (error) {
    next(error);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    res.json({ success: true, ...getFootballConfigStatus() });
  } catch (error) {
    next(error);
  }
});

router.post('/sync', async (req, res, next) => {
  try {
    const result = await syncFootballMatches();
    const widget = await getFootballWidgetData();
    res.json({ success: true, ...result, widget });
  } catch (error) {
    next(error);
  }
});

router.get('/debug', async (req, res, next) => {
  try {
    res.json({ success: true, ...(await getFootballDebugInfo()) });
  } catch (error) {
    next(error);
  }
});

export default router;
