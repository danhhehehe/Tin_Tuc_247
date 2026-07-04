import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Article from '../models/Article.js';
import { getRiceRelevanceScore, isRiceArticle } from '../utils/categoryValidator.js';

dotenv.config();
await connectDB(process.env.MONGODB_URI);

const articles = await Article.find({ category: 'lua-gao' }).select('title sourceName category relevanceScore url summary description content tags').lean();
const checked = articles.map((article) => ({
  ...article,
  relevanceScore: getRiceRelevanceScore(article),
  valid: isRiceArticle(article)
}));
const suspicious = checked.filter((article) => !article.valid);

console.log(`Tong bai lua-gao: ${checked.length}`);
console.log(`Co ve dung: ${checked.length - suspicious.length}`);
console.log(`Nghi sai: ${suspicious.length}`);
console.table(suspicious.slice(0, 30).map((article) => ({
  title: article.title,
  sourceName: article.sourceName,
  category: article.category,
  relevanceScore: article.relevanceScore,
  url: article.url
})));

process.exit(0);
