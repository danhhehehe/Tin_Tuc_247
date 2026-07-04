import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Article from '../models/Article.js';
import { detectBetterCategory, getRiceRelevanceScore, isRiceArticle } from '../utils/categoryValidator.js';

dotenv.config();
await connectDB(process.env.MONGODB_URI);

const articles = await Article.find({ category: 'lua-gao' }).lean();
let fixed = 0;
let scored = 0;

for (const article of articles) {
  const relevanceScore = getRiceRelevanceScore(article);
  const update = { relevanceScore };
  scored += 1;

  if (!isRiceArticle(article)) {
    const category = detectBetterCategory(article, 'khac');
    update.category = category;
    update.tags = Array.from(new Set([category, ...(article.tags || []).filter((tag) => tag !== 'lua-gao')]));
    fixed += 1;
  }

  await Article.updateOne({ _id: article._id }, { $set: update });
}

console.log(`Da cham diem: ${scored}`);
console.log(`Da sua category sai: ${fixed}`);
process.exit(0);
