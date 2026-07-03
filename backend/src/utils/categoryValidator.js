import { removeVietnameseTones } from './text.js';

const riceKeywords = [
  'lua', 'gao', 'lua gao', 'hat gao', 'gia lua', 'gia gao', 'xuat khau gao',
  'gao viet nam', 'thi truong gao', 'thi truong lua gao', 'cay lua',
  'nong dan trong lua', 'ruong lua', 'dong lua', 'vua lua', 'giong lua',
  'san luong lua', 'san luong gao', 'lua dong xuan', 'lua he thu',
  'lua thu dong', 'dbscl', 'dong bang song cuu long', 'mekong delta',
  'rice', 'paddy', 'rice price', 'rice export', 'vietnam rice'
];

const strongRiceKeywords = [
  'lua gao', 'hat gao', 'gia lua', 'gia gao', 'xuat khau gao', 'thi truong gao',
  'thi truong lua gao', 'san luong lua', 'san luong gao', 'rice price',
  'rice export', 'vietnam rice'
];

const trafficKeywords = [
  'giao thong', 'ha tang', 'cao toc', 'duong tinh', 'duong dt', 'du an duong',
  'ket noi cao toc', 'cau duong', 'van tai', 'tai nan giao thong'
];

const falseRicePhrases = ['gao coi'];

export function getArticleText(article = {}) {
  return removeVietnameseTones([
    article.title,
    article.summary,
    article.description,
    article.content,
    Array.isArray(article.tags) ? article.tags.join(' ') : article.tags
  ].filter(Boolean).join(' '));
}

export function getRiceRelevanceScore(article = {}) {
  const text = getArticleText(article);
  if (!text) return 0;

  if (falseRicePhrases.some((phrase) => text.includes(phrase)) && !strongRiceKeywords.some((word) => text.includes(word))) {
    return 0;
  }

  let score = 0;
  for (const word of riceKeywords) {
    if (text.includes(word)) score += strongRiceKeywords.includes(word) ? 3 : 1;
  }

  if (trafficKeywords.some((word) => text.includes(word)) && score < 4) return 0;
  return score;
}

export function isRiceArticle(article = {}) {
  return getRiceRelevanceScore(article) > 0;
}

export function detectBetterCategory(article = {}, fallback = 'khac') {
  const text = getArticleText(article);
  if (trafficKeywords.some((word) => text.includes(word))) return 'giao-thong';
  if (isRiceArticle(article)) return 'lua-gao';
  return fallback;
}
