import mongoose from 'mongoose';

const ricePriceSchema = new mongoose.Schema(
  {
    variety: { type: String, required: true, trim: true, index: true },
    group: {
      type: String,
      enum: ['lua-tuoi', 'gao-nguyen-lieu', 'gao-thanh-pham', 'gao-xuat-khau', 'phu-pham', 'khac'],
      default: 'lua-tuoi',
      index: true
    },
    region: { type: String, default: 'ĐBSCL', trim: true, index: true },
    priceText: { type: String, required: true, trim: true },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    unit: { type: String, default: 'đ/kg' },
    changeText: { type: String, default: '' },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable', 'unknown'],
      default: 'unknown'
    },
    sourceName: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    priceDate: { type: Date, default: Date.now, index: true },
    fetchedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

ricePriceSchema.index({ variety: 1, region: 1, sourceName: 1, priceDate: 1 });
ricePriceSchema.index({ fetchedAt: -1, priceDate: -1 });

export default mongoose.model('RicePrice', ricePriceSchema);
