import axios from 'axios';
import Article from '../models/Article.js';
import { queryToCategory } from '../utils/category.js';
import { normalizeTextFields } from '../utils/textNormalize.js';

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 18000);
const MAX_CONTEXT_ARTICLES = Math.min(Math.max(Number(process.env.AI_CONTEXT_ARTICLES || 8), 3), 12);

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(date) {
  if (!date) return 'chưa rõ ngày';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch {
    return 'chưa rõ ngày';
  }
}

function articleToContext(article, index) {
  const source = article.sourceName || article.source || 'Tin Tức 247';
  const time = formatDate(article.publishedAt || article.fetchedAt || article.createdAt);
  const summary = article.summary || article.description || article.aiBrief || article.content || '';
  return `${index + 1}. ${article.title}\nNguồn: ${source}\nThời gian: ${time}\nTóm tắt: ${summary.slice(0, 520)}\nSlug: ${article.slug}`;
}

function articleToPublic(article) {
  return normalizeTextFields(article, ['title', 'summary', 'description', 'sourceName', 'source', 'aiBrief']);
}

async function findContextArticles(query = '') {
  const text = query.trim();
  const category = queryToCategory(text);
  const filters = [];

  if (text) {
    const regex = new RegExp(escapeRegex(text), 'i');
    filters.push({
      $or: [
        { title: regex },
        { summary: regex },
        { description: regex },
        { content: regex },
        { tags: regex }
      ]
    });
  }

  if (category) filters.push({ category });

  const filter = filters.length ? { $or: filters } : {};
  let rows = await Article.find(filter)
    .sort({ publishedAt: -1, fetchedAt: -1, createdAt: -1 })
    .limit(MAX_CONTEXT_ARTICLES)
    .lean();

  if (rows.length < 3 && category) {
    const more = await Article.find({ category })
      .sort({ publishedAt: -1, fetchedAt: -1, createdAt: -1 })
      .limit(MAX_CONTEXT_ARTICLES)
      .lean();
    const seen = new Set(rows.map((item) => String(item._id)));
    rows = [...rows, ...more.filter((item) => !seen.has(String(item._id)))].slice(0, MAX_CONTEXT_ARTICLES);
  }

  if (!rows.length) {
    rows = await Article.find()
      .sort({ publishedAt: -1, fetchedAt: -1, createdAt: -1 })
      .limit(MAX_CONTEXT_ARTICLES)
      .lean();
  }

  return rows;
}

function buildPrompt({ query, articles }) {
  const context = articles.length
    ? articles.map(articleToContext).join('\n\n')
    : 'Chưa có bài viết nào trong cơ sở dữ liệu.';

  return `Bạn là AI biên tập viên của website Tin Tức 247. Trả lời bằng tiếng Việt, dễ hiểu, ngắn gọn nhưng hữu ích.\n\nCâu hỏi của người dùng: ${query}\n\nDữ liệu tin tức mới nhất trong hệ thống:\n${context}\n\nYêu cầu trả lời:\n- Chỉ dựa vào dữ liệu tin tức được cung cấp ở trên.\n- Nêu rõ nếu dữ liệu trong hệ thống còn thiếu hoặc cần bấm Cập nhật tin.\n- Gợi ý 3 hành động/từ khóa người dùng có thể bấm tiếp.\n- Không bịa số liệu, không tạo URL giả.\n- Nếu có tin phù hợp, nhắc tiêu đề và nguồn của 2-4 tin đáng đọc nhất.`;
}

function providerOrder() {
  return String(process.env.AI_PROVIDERS || 'openai,gemini,groq,ollama,local')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function providerStatus() {
  return {
    order: providerOrder(),
    providers: {
      openai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
      },
      gemini: {
        configured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY),
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      },
      groq: {
        configured: Boolean(process.env.GROQ_API_KEY),
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      },
      ollama: {
        configured: Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL),
        model: process.env.OLLAMA_MODEL || 'llama3.1:8b'
      },
      local: {
        configured: true,
        model: 'local-news-ranker'
      }
    }
  };
}

async function callOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY chưa cấu hình');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      temperature: 0.25,
      messages: [
        { role: 'system', content: 'Bạn là trợ lý tin tức tiếng Việt, trả lời có căn cứ từ ngữ cảnh.' },
        { role: 'user', content: prompt }
      ]
    },
    {
      timeout: AI_TIMEOUT_MS,
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    }
  );
  return { provider: 'openai', model, answer: response.data?.choices?.[0]?.message?.content?.trim() || '' };
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY chưa cấu hình');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25 }
    },
    {
      timeout: AI_TIMEOUT_MS,
      params: { key }
    }
  );
  const answer = response.data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim() || '';
  return { provider: 'gemini', model, answer };
}

async function callGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY chưa cấu hình');
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Bạn là trợ lý tin tức tiếng Việt, trả lời có căn cứ từ ngữ cảnh.' },
        { role: 'user', content: prompt }
      ]
    },
    {
      timeout: AI_TIMEOUT_MS,
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    }
  );
  return { provider: 'groq', model, answer: response.data?.choices?.[0]?.message?.content?.trim() || '' };
}

async function callOllama(prompt) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
  if (!process.env.OLLAMA_BASE_URL && !process.env.OLLAMA_MODEL) throw new Error('OLLAMA_BASE_URL/OLLAMA_MODEL chưa cấu hình');
  const response = await axios.post(
    `${baseUrl}/api/generate`,
    { model, prompt, stream: false, options: { temperature: 0.2 } },
    { timeout: AI_TIMEOUT_MS }
  );
  return { provider: 'ollama', model, answer: response.data?.response?.trim() || '' };
}

function makeLocalSuggestions(query, category) {
  const base = category
    ? [`Tin mới ${category.replaceAll('-', ' ')}`, `Tóm tắt chuyên mục ${category.replaceAll('-', ' ')}`, 'Cập nhật tin ngay']
    : ['Tin lúa gạo hôm nay', 'Tin bóng đá mới', 'Tóm tắt tin nổi bật'];
  if (/giá|gia|lúa|lua|gạo|gao/i.test(query)) return ['Mở bảng giá lúa gạo', 'Tin xuất khẩu gạo', 'Giá gạo hôm nay'];
  if (/bóng|bong|football|tỉ số|ti so|lịch|lich/i.test(query)) return ['Lịch bóng đá hôm nay', 'Tin bóng đá mới nhất', 'Kết quả đã kết thúc'];
  return base;
}

function localAnswer({ query, articles }) {
  const category = queryToCategory(query);
  if (!articles.length) {
    return {
      provider: 'local',
      model: 'local-news-ranker',
      answer: 'Hiện cơ sở dữ liệu chưa có tin để phân tích. Bạn hãy bấm Cập nhật tin để hệ thống kéo RSS mới, sau đó hỏi lại AI.',
      suggestions: makeLocalSuggestions(query, category)
    };
  }

  const headlineList = articles.slice(0, 4).map((article, index) => {
    const source = article.sourceName || article.source || 'Tin Tức 247';
    const time = formatDate(article.publishedAt || article.fetchedAt || article.createdAt);
    const summary = article.summary || article.description || article.aiBrief || '';
    return `${index + 1}. ${article.title} — ${source}, ${time}. ${summary ? `Ý chính: ${summary.slice(0, 180)}` : ''}`;
  }).join('\n');

  const answer = `Mình tìm trong dữ liệu mới nhất của Tin Tức 247 và thấy ${articles.length} tin liên quan. Các tin nên đọc trước:\n${headlineList}\n\nNhận xét nhanh: hãy ưu tiên tin có thời gian mới nhất và nguồn rõ ràng. Nếu bạn muốn dữ liệu mới hơn, bấm Cập nhật tin rồi hỏi lại AI.`;
  return {
    provider: 'local',
    model: 'local-news-ranker',
    answer,
    suggestions: makeLocalSuggestions(query, category)
  };
}

async function tryProvider(name, prompt) {
  if (name === 'openai') return callOpenAI(prompt);
  if (name === 'gemini') return callGemini(prompt);
  if (name === 'groq') return callGroq(prompt);
  if (name === 'ollama') return callOllama(prompt);
  throw new Error(`Provider ${name} không hỗ trợ`);
}

export async function getAiAssistantStatus() {
  return providerStatus();
}

export async function smartAssistantReply({ query = '' } = {}) {
  const text = query.trim();
  const articles = await findContextArticles(text);
  const prompt = buildPrompt({ query: text || 'Tóm tắt tin mới nhất', articles });
  const errors = [];

  for (const provider of providerOrder()) {
    if (provider === 'local') break;
    try {
      const result = await tryProvider(provider, prompt);
      if (result.answer) {
        return {
          success: true,
          provider: result.provider,
          model: result.model,
          answer: result.answer,
          message: result.answer,
          suggestions: makeLocalSuggestions(text, queryToCategory(text)),
          data: articles.map(articleToPublic),
          errors
        };
      }
      errors.push({ provider, reason: 'Provider trả lời rỗng' });
    } catch (error) {
      errors.push({ provider, reason: error.response?.status ? `HTTP ${error.response.status}` : error.message });
    }
  }

  const fallback = localAnswer({ query: text, articles });
  return {
    success: true,
    ...fallback,
    message: fallback.answer,
    data: articles.map(articleToPublic),
    errors
  };
}
