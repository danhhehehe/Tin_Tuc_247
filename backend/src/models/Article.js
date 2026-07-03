import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    url: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: 'Unknown', index: true },
    sourceName: { type: String, default: 'Unknown', index: true },
    sourceUrl: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    language: { type: String, default: 'vi' },
    author: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now, index: true },
    fetchedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    readingTime: { type: Number, default: 1 },
    crawlType: { type: String, default: 'rss', index: true },
    relevanceScore: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    aiBrief: { type: String, default: '' }
  },
  { timestamps: true }
);

articleSchema.index(
  { title: 'text', summary: 'text', description: 'text', content: 'text', tags: 'text' },
  { default_language: 'none', language_override: 'textLanguage' }
);
articleSchema.index({ category: 1, publishedAt: -1 });

export default mongoose.model('Article', articleSchema);
