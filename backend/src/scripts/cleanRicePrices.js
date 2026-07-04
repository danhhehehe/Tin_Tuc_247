import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import RicePrice from '../models/RicePrice.js';
import { isValidRicePriceItem } from '../utils/ricePriceExtractor.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

try {
  await connectDB(uri);
  const rows = await RicePrice.find().lean();
  const invalidIds = rows.filter((row) => !isValidRicePriceItem(row)).map((row) => row._id);

  if (invalidIds.length) {
    await RicePrice.deleteMany({ _id: { $in: invalidIds } });
  }

  console.log(`Đã kiểm tra ${rows.length} dòng giá lúa.`);
  console.log(`Đã xóa ${invalidIds.length} dòng không hợp lệ.`);
  process.exit(0);
} catch (error) {
  console.error('[CLEAN RICE PRICES FAILED]', error.message);
  process.exit(1);
}
