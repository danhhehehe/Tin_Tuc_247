import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../../../frontend/src', import.meta.url));
const badPatterns = [
  /Bat tu/i,
  /Tat tu/i,
  /Xem chi tiet/i,
  /Doc tin/i,
  /Dung doc/i,
  /Tin truoc/i,
  /Luu tin/i,
  /Tin Tuc 247/i,
  /Hien chua tai/i
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const offenders = [];
for (const file of walk(root).filter((path) => /\.(jsx?|css)$/.test(path))) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of badPatterns) {
    if (pattern.test(text)) offenders.push(`${file}: ${pattern}`);
  }
}

if (offenders.length) {
  console.error('Phát hiện chuỗi UI cần sửa:');
  offenders.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Không phát hiện chuỗi UI tiếng Việt không dấu phổ biến.');
