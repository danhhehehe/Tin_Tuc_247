import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDefaultFeeds } from '../services/feedSeeder.js';
import { crawlRiceSources } from '../services/riceNewsCrawler.js';

dotenv.config();
await connectDB(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247');
await seedDefaultFeeds();
await crawlRiceSources();

process.exit(0);
