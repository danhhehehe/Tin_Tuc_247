import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import { seedDefaultFeeds } from '../src/services/feedSeeder.js';
import { syncAllFeedsLocked } from '../src/services/newsSyncService.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247';

await connectDB(MONGO_URI);
await seedDefaultFeeds();
const log = await syncAllFeedsLocked();
console.log(log.message);
if (log.errors?.length) console.table(log.errors);
process.exit(0);
