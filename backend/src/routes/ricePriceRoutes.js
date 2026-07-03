import { Router } from 'express';
import { getLatestRicePrices, getRicePriceHistory, syncRicePrices } from '../services/ricePriceService.js';

const EMPTY_MESSAGE = 'Chưa có bảng giá lúa mới. Hệ thống đang cập nhật.';

const router = Router();

router.get('/latest', async (req, res, next) => {
  try {
    const data = await getLatestRicePrices(Number(req.query.limit || 8));
    res.json({
      success: true,
      data,
      updatedAt: data[0]?.fetchedAt || data[0]?.priceDate || null,
      message: data.length ? (data[0]?.referenceOnly ? 'Đang hiển thị bảng giá tham khảo vì nguồn trực tuyến chưa phản hồi.' : 'Đã tải bảng giá lúa mới nhất.') : EMPTY_MESSAGE
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const data = await getRicePriceHistory({ variety: req.query.variety || '', limit: req.query.limit || 30 });
    res.json({
      success: true,
      data,
      message: data.length ? 'Đã tải lịch sử giá lúa.' : EMPTY_MESSAGE
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sync', async (req, res, next) => {
  try {
    const result = await syncRicePrices();
    const data = await getLatestRicePrices(Number(req.query.limit || 8));
    res.json({ success: true, ...result, data });
  } catch (error) {
    next(error);
  }
});

export default router;
