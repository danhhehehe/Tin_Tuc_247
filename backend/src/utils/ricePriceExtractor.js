import { normalizeVietnameseText } from './textNormalize.js';

const INVALID_VARIETY_PATTERNS = [
  /tầm nhìn/i,
  /sứ mệnh/i,
  /ban chấp hành/i,
  /tin tức/i,
  /sự kiện/i,
  /hotline/i,
  /liên hệ/i,
  /giới thiệu/i,
  /trang chủ/i,
  /chính sách/i,
  /sản phẩm/i,
  /dịch vụ/i,
  /hiệp hội/i,
  /ngành hàng/i,
  /xu hướng/i,
  /biểu đồ/i,
  /đang tải/i,
  /toggle/i,
  /navigation/i,
  /tin nổi bật/i,
  /báo cáo/i,
  /cung cầu/i
];

const VARIETY_PATTERNS = [
  { pattern: /\bOM\s?18\b/i, name: 'OM 18', group: 'lua-tuoi' },
  { pattern: /\bOM\s?5451\b/i, name: 'OM 5451', group: 'lua-tuoi' },
  { pattern: /\bIR\s?50404\b/i, name: 'IR 50404', group: 'lua-tuoi' },
  { pattern: /\bCL\s?555\b/i, name: 'CL 555', group: 'gao-nguyen-lieu' },
  { pattern: /\bOM\s?380\b/i, name: 'OM 380', group: 'gao-nguyen-lieu' },
  { pattern: /đài\s*thơm\s*8|dai\s*thom\s*8/i, name: 'Đài Thơm 8', group: 'lua-tuoi' },
  { pattern: /nàng\s*hoa\s*9|nang\s*hoa\s*9/i, name: 'Nàng Hoa 9', group: 'lua-tuoi' },
  { pattern: /\bJasmine\b/i, name: 'Jasmine', group: 'lua-tuoi' },
  { pattern: /japanese\s*rice|gạo\s*nhật|gao\s*nhat/i, name: 'Gạo Nhật', group: 'gao-thanh-pham' },
  { pattern: /nàng\s*nhen|nang\s*nhen/i, name: 'Nàng Nhen', group: 'gao-thanh-pham' },
  { pattern: /sóc\s*thơm|soc\s*thom/i, name: 'Sóc Thơm', group: 'gao-nguyen-lieu' },
  { pattern: /sóc\s*thái|soc\s*thai|thai\s*long-grain/i, name: 'Sóc Thái', group: 'gao-thanh-pham' },
  { pattern: /\bST\s?24\b/i, name: 'ST24', group: 'lua-tuoi' },
  { pattern: /\bST\s?25\b/i, name: 'ST25', group: 'lua-tuoi' },
  { pattern: /nếp\s*IR\s*4625/i, name: 'Nếp IR 4625', group: 'lua-tuoi' },
  { pattern: /\bnếp\b/i, name: 'Nếp', group: 'lua-tuoi' },
  { pattern: /gạo\s+nguyên\s+liệu/i, name: 'Gạo nguyên liệu', group: 'gao-nguyen-lieu' },
  { pattern: /gạo\s+thành\s+phẩm/i, name: 'Gạo thành phẩm', group: 'gao-thanh-pham' },
  { pattern: /gạo\s*5%\s*tấm/i, name: 'Gạo 5% tấm', group: 'gao-xuat-khau' },
  { pattern: /gạo\s*25%\s*tấm/i, name: 'Gạo 25% tấm', group: 'gao-xuat-khau' },
  { pattern: /tấm\s*thơm/i, name: 'Tấm thơm', group: 'phu-pham' },
  { pattern: /\bcám\b/i, name: 'Cám', group: 'phu-pham' }
];

const REGION_PATTERNS = [
  { pattern: /an giang/i, region: 'An Giang' },
  { pattern: /đồng tháp|dong thap/i, region: 'Đồng Tháp' },
  { pattern: /long an/i, region: 'Long An' },
  { pattern: /cần thơ|can tho/i, region: 'Cần Thơ' },
  { pattern: /kiên giang|kien giang/i, region: 'Kiên Giang' },
  { pattern: /sóc trăng|soc trang/i, region: 'Sóc Trăng' },
  { pattern: /đbscl|đồng bằng sông cửu long|mien tay|miền tây/i, region: 'ĐBSCL' },
  { pattern: /xuất khẩu|xuat khau/i, region: 'Xuất khẩu' }
];

const priceRangeRegex = /(\d{1,3}(?:[.,]\d{3})+|\d{4,5}|\d{2,4})\s*(?:-|–|—|đến|toi|tới)\s*(\d{1,3}(?:[.,]\d{3})+|\d{4,5}|\d{2,4})\s*(đồng\/kg|đ\/kg|vnđ\/kg|vnd\/kg|usd\/tấn|usd\/tan|usd\/ton|usd\/tonne)?/i;
const singlePriceRegex = /(\d{1,3}(?:[.,]\d{3})+|\d{4,5})\s*(đồng\/kg|đ\/kg|vnđ\/kg|vnd\/kg|usd\/tấn|usd\/tan|usd\/ton|usd\/tonne)/i;
const looseSinglePriceRegex = /(\d{1,3}(?:[.,]\d{3})+|\d{4,5})(?!\s*(?:người|ha|tấn\s+lúa|năm|%))/i;

function parseNumber(value = '') {
  const raw = String(value).replace(/[.,]/g, '');
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUnit(unit = '', line = '') {
  const text = `${unit} ${line}`.toLowerCase();
  if (/usd/.test(text)) return 'USD/tấn';
  return 'đ/kg';
}

function formatNumber(value) {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

function getVariety(line = '') {
  return VARIETY_PATTERNS.find((item) => item.pattern.test(line));
}

function getRegion(line = '') {
  return REGION_PATTERNS.find((item) => item.pattern.test(line))?.region || 'ĐBSCL';
}

function getTrend(line = '') {
  if (/[+↑]|tăng/i.test(line)) return 'up';
  if (/[-↓]|giảm/i.test(line)) return 'down';
  if (/ổn định|đi ngang|không đổi/i.test(line)) return 'stable';
  return 'unknown';
}

function getChangeText(line = '') {
  return line.match(/(?:tăng|giảm|\+|-|↑|↓)\s*\d{1,3}(?:[.,]\d{3})?\s*(?:đ\/kg|đồng\/kg|đ)?/i)?.[0] || '';
}

function makePriceText(minPrice, maxPrice, unit) {
  if (minPrice !== null && maxPrice !== null && minPrice !== maxPrice) {
    return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)} ${unit}`;
  }
  return `${formatNumber(minPrice ?? maxPrice)} ${unit}`;
}

function getCandidateLines(text = '') {
  const normalized = normalizeVietnameseText(text)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ');

  const chunks = normalized
    .split(/(?:\n|\r|;|•|\|)/)
    .flatMap((chunk) => chunk.split(/(?<=\bkg|\btấn|\btan|\bton)\s*[.。]/i))
    .map((line) => line.trim())
    .filter(Boolean);

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return [...chunks, ...sentences]
    .map((line) => line.slice(0, 320))
    .filter((line, index, arr) => arr.indexOf(line) === index);
}

export function isValidRicePriceItem(item = {}) {
  const variety = normalizeVietnameseText(item.variety || '');
  const priceText = normalizeVietnameseText(item.priceText || '');
  const hasParsedPrice = Number.isFinite(Number(item.minPrice)) || Number.isFinite(Number(item.maxPrice));
  const hasPriceShape = priceRangeRegex.test(priceText) || singlePriceRegex.test(priceText) || (/^\d{1,3}(?:[.,]\d{3})*(?:\s*-\s*\d{1,3}(?:[.,]\d{3})*)?\s*(?:đ|đ\/kg|đồng\/kg|USD\/tấn|USD\/ton)$/i.test(priceText) && hasParsedPrice);

  if (!variety || !priceText || !/\d/.test(priceText)) return false;
  if (priceText.length > 80) return false;
  if (!hasParsedPrice || !hasPriceShape) return false;
  if (INVALID_VARIETY_PATTERNS.some((pattern) => pattern.test(variety))) return false;
  if (INVALID_VARIETY_PATTERNS.some((pattern) => pattern.test(priceText))) return false;
  if (!VARIETY_PATTERNS.some((entry) => entry.name.toLowerCase() === variety.toLowerCase() || entry.pattern.test(variety))) return false;
  return true;
}

export function extractRicePricesFromText(text = '', source = {}) {
  const rows = [];

  for (const line of getCandidateLines(text)) {
    const varietyMatch = getVariety(line);
    if (!varietyMatch) continue;

    const range = line.match(priceRangeRegex);
    const single = range ? null : (line.match(singlePriceRegex) || line.match(looseSinglePriceRegex));
    if (!range && !single) continue;

    const minPrice = parseNumber(range?.[1] || single?.[1]);
    const maxPrice = parseNumber(range?.[2] || single?.[1]);
    const unit = normalizeUnit(range?.[3] || single?.[2], line);
    if (minPrice === null && maxPrice === null) continue;

    const item = {
      variety: varietyMatch.name,
      group: varietyMatch.group,
      region: getRegion(line),
      priceText: makePriceText(minPrice, maxPrice, unit),
      minPrice,
      maxPrice,
      unit,
      changeText: getChangeText(line),
      trend: getTrend(line),
      sourceName: source.name || '',
      sourceUrl: source.url || '',
      priceDate: source.priceDate || new Date(),
      fetchedAt: new Date()
    };

    if (isValidRicePriceItem(item)) rows.push(item);
  }

  const seen = new Set();
  return rows.filter((item) => {
    const key = `${item.variety}|${item.region}|${item.priceText}|${item.sourceName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
