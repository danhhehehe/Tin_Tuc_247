import mongoose from 'mongoose';

const footballMatchSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, index: true },
    provider: { type: String, default: 'unknown', index: true },
    league: { type: String, default: '' },
    competitionCode: { type: String, default: '' },
    season: { type: String, default: '' },
    round: { type: String, default: '' },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeLogo: { type: String, default: '' },
    awayLogo: { type: String, default: '' },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
    status: {
      type: String,
      enum: ['SCHEDULED', 'TIMED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELED', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true
    },
    matchTime: { type: Date, default: Date.now, index: true },
    minute: { type: String, default: '' },
    venue: { type: String, default: '' },
    sourceName: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    fetchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

footballMatchSchema.index({ externalId: 1, provider: 1 }, { unique: true });
footballMatchSchema.index({ matchTime: -1 });

export default mongoose.model('FootballMatch', footballMatchSchema);
