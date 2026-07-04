import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { syncRicePrices } from '../services/ricePriceService.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

try {
  await connectDB(uri);
  const result = await syncRicePrices();
  console.log(result.message);
  process.exit(0);
} catch (error) {
  console.error('[SYNC RICE PRICES FAILED]', error.message);
  process.exit(1);
}
