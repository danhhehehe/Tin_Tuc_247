import mongoose from 'mongoose';

const feedSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, unique: true, trim: true },
    homepage: { type: String, default: '' },
    type: { type: String, enum: ['rss', 'html-list', 'html-article', 'google-news'], default: 'rss', index: true },
    category: { type: String, required: true, index: true },
    language: { type: String, default: 'vi' },
    enabled: { type: Boolean, default: true, index: true },
    active: { type: Boolean, default: true, index: true },
    parserConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    crawlFrequencyMinutes: { type: Number, default: 30 },
    priority: { type: Number, default: 1 },
    lastFetchedAt: { type: Date },
    lastStatus: { type: String, default: 'pending' },
    lastError: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('FeedSource', feedSourceSchema);
