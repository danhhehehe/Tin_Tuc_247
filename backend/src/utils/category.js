import { removeVietnameseTones } from './text.js';

const rules = [
  { key: 'lua-gao', words: ['lua gao', 'hat gao', 'gao', 'rice', 'xuat khau gao', 'gia gao', 'thi truong gao', 'san xuat lua'] },
  { key: 'nong-nghiep', words: ['nong nghiep', 'nha nong', 'trong trot', 'chan nuoi', 'phan bon', 'nong dan', 'canh tac'] },
  { key: 'bong-da', words: ['bong da', 'football', 'v-league', 'cup', 'world cup', 'uefa', 'afc', 'doi tuyen'] },
  { key: 'giao-thong', words: ['giao thong', 'tai nan', 'duong bo', 'cao toc', 'ket xe', 'xe may', 'o to', 'toc do'] },
  { key: 'an-toan-lao-dong', words: ['an toan lao dong', 'tai nan lao dong', 'cong nhan', 'nha may', 'bao ho lao dong', 'xay dung'] },
  { key: 'cong-nghe', words: ['cong nghe', 'ai', 'tri tue nhan tao', 'iphone', 'android', 'software', 'chip', 'robot'] },
  { key: 'kinh-doanh', words: ['kinh doanh', 'thi truong', 'tai chinh', 'chung khoan', 'gia vang', 'xuat khau', 'nhap khau'] },
  { key: 'suc-khoe', words: ['suc khoe', 'benh', 'bac si', 'dinh duong', 'y te', 'benh vien'] },
  { key: 'the-gioi', words: ['the gioi', 'quoc te', 'my', 'trung quoc', 'nga', 'ukraine', 'israel'] }
];

function isFalseRiceMatch(text = '') {
  const hasStrongRiceTerm = ['lua gao', 'hat gao', 'xuat khau gao', 'gia gao', 'thi truong gao', 'san xuat lua', 'rice'].some((word) => text.includes(word));
  return !hasStrongRiceTerm && text.includes('gao coi');
}

export function smartCategory(title = '', summary = '', fallback = 'moi-nhat') {
  const text = removeVietnameseTones(`${title} ${summary}`);
  const matched = rules.find((rule) => {
    if (rule.key === 'lua-gao' && isFalseRiceMatch(text)) return false;
    return rule.words.some((word) => text.includes(word));
  });
  return matched?.key || fallback;
}

export function queryToCategory(query = '') {
  const text = removeVietnameseTones(query);
  const matched = rules.find((rule) => rule.words.some((word) => text.includes(word)));
  return matched?.key || '';
}

export function makeTags(title = '', summary = '', category = '') {
  const text = removeVietnameseTones(`${title} ${summary}`);
  const base = [category].filter(Boolean);
  rules.forEach((rule) => {
    if (rule.key === 'lua-gao' && isFalseRiceMatch(text)) return;
    if (rule.words.some((word) => text.includes(word))) base.push(rule.key);
  });
  return [...new Set(base)].slice(0, 8);
}
