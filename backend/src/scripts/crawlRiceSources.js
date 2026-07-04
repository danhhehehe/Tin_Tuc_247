import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDefaultFeeds } from '../services/feedSeeder.js';
import { crawlRiceSources } from '../services/riceNewsCrawler.js';

dotenv.config();
await connectDB(process.env.MONGODB_URI);
await seedDefaultFeeds();
await crawlRiceSources();

process.exit(0);
