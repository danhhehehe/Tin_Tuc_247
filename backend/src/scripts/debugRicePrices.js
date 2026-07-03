import dotenv from 'dotenv';
import { debugRicePriceSources } from '../services/ricePriceService.js';

dotenv.config();

const results = await debugRicePriceSources();

for (const result of results) {
  console.log('='.repeat(72));
  console.log(`Nguồn: ${result.source.name}`);
  console.log(`URL: ${result.source.url}`);

  if (!result.ok) {
    console.log(`Lỗi: ${result.error}`);
    continue;
  }

  console.log(`Trích xuất được: ${result.count} dòng giá`);
  console.log('Text mẫu:');
  console.log((result.sampleText || '').slice(0, 700));
  console.log('Danh sách giá:');
  for (const item of result.prices) {
    console.log(`- ${item.variety} | ${item.priceText} | ${item.region} | ${item.sourceName}`);
  }
}
