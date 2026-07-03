import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,
    totalFeeds: { type: Number, default: 0 },
    inserted: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    success: { type: Number, default: 0 },
    sourceErrors: [
      {
        source: String,
        url: String,
        status: Number,
        reason: String,
        errorType: String,
        attempts: Number
      }
    ],
    message: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('SyncLog', syncLogSchema);
