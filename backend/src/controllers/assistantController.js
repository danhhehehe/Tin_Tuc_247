import Article from '../models/Article.js';
import { queryToCategory } from '../utils/category.js';
import { getAiAssistantStatus, smartAssistantReply } from '../services/aiAssistantService.js';

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function assistantSearch(req, res, next) {
  try {
    const { query = '' } = req.body;
    const text = query.trim();

    if (!text) {
      return res.status(400).json({ message: 'Vui lòng nói hoặc nhập nội dung cần tìm.' });
    }

    const category = queryToCategory(text);
    const filter = {
      $or: [
        { title: { $regex: escapeRegex(text), $options: 'i' } },
        { summary: { $regex: escapeRegex(text), $options: 'i' } },
        { tags: { $regex: escapeRegex(text), $options: 'i' } }
      ]
    };

    if (category) {
      filter.$or.push({ category });
    }

    const articles = await Article.find(filter).sort({ publishedAt: -1 }).limit(8).lean();
    const message = articles.length
      ? `Tôi tìm thấy ${articles.length} tin phù hợp với “${text}”. Tin mới nhất là: ${articles[0].title}`
      : `Tôi chưa thấy tin phù hợp với “${text}”. Bạn có thể bấm Cập nhật ngay hoặc thử từ khóa ngắn hơn.`;

    res.json({ message, category, data: articles });
  } catch (error) {
    next(error);
  }
}


export async function assistantChat(req, res, next) {
  try {
    const { query = '' } = req.body;
    const text = query.trim();

    if (!text) {
      return res.status(400).json({ message: 'Vui lòng nhập câu hỏi cho AI.' });
    }

    const result = await smartAssistantReply({ query: text });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function assistantStatus(req, res, next) {
  try {
    res.json({ success: true, ...(await getAiAssistantStatus()) });
  } catch (error) {
    next(error);
  }
}
