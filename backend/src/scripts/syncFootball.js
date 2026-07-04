import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { syncFootballMatches } from '../services/footballService.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

try {
  await connectDB(uri);
  const result = await syncFootballMatches();
  console.log(result.message);
  process.exit(0);
} catch (error) {
  console.error('[SYNC FOOTBALL FAILED]', error.message);
  process.exit(1);
}
