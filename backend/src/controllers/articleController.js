import Article from '../models/Article.js';
import { normalizeTextFields } from '../utils/textNormalize.js';

const MAX_LATEST_DISPLAY_ARTICLES = Math.max(Number(process.env.MAX_LATEST_DISPLAY_ARTICLES) || 4000, 1);
const MAX_ARTICLES_PER_PAGE = Math.max(Number(process.env.MAX_ARTICLES_PER_PAGE) || 100, 1);

const categoryDisplay = [
  { key: 'moi-nhat', label: 'Mới nhất', icon: 'Tin' },
  { key: 'nong-nghiep', label: 'Nông nghiệp', icon: 'NN' },
  { key: 'lua-gao', label: 'Lúa gạo', icon: 'LG' },
  { key: 'nong-nghiep-the-gioi', label: 'Nông nghiệp thế giới', icon: 'TG' },
  { key: 'bong-da', label: 'Bóng đá', icon: 'BĐ' },
  { key: 'thoi-su', label: 'Thời sự', icon: 'TS' },
  { key: 'giao-thong', label: 'Giao thông', icon: 'GT' },
  { key: 'an-toan-lao-dong', label: 'An toàn lao động', icon: 'AT' },
  { key: 'cong-nghe', label: 'Công nghệ', icon: 'CN' },
  { key: 'kinh-doanh', label: 'Kinh doanh', icon: 'KD' },
  { key: 'suc-khoe', label: 'Sức khỏe', icon: 'SK' },
  { key: 'khoa-hoc', label: 'Khoa học', icon: 'KH' },
  { key: 'the-gioi', label: 'Thế giới', icon: 'TG' },
  { key: 'khac', label: 'Tin khác', icon: 'Khác' }
];

function normalizeArticle(article) {
  return normalizeTextFields(article, ['title', 'summary', 'content', 'description', 'source', 'sourceName', 'aiBrief', 'author']);
}

export async function getArticles(req, res, next) {
  try {
    const {
      q = '',
      category = '',
      source = '',
      sort = 'latest',
      featured = ''
    } = req.query;

    const pageNumber = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 24, 1), MAX_ARTICLES_PER_PAGE);
    const skip = (pageNumber - 1) * pageSize;
    const remainingDisplaySlots = Math.max(MAX_LATEST_DISPLAY_ARTICLES - skip, 0);
    const queryLimit = Math.min(pageSize, remainingDisplaySlots);

    const filter = {};
    if (category && category !== 'all' && category !== 'moi-nhat') {
      filter.category = category;
      if (category === 'lua-gao') filter.relevanceScore = { $gt: 0 };
    }
    if (source) filter.source = source;
    if (featured === 'true') filter.isFeatured = true;

    if (q.trim()) {
      const keyword = q.trim();
      const searchFilter = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ];
      filter.$and = [...(filter.$and || []), { $or: searchFilter }];
    }

    const latestSort = { publishedAt: -1, fetchedAt: -1, createdAt: -1 };
    const sortMap = {
      latest: latestSort,
      popular: { views: -1, ...latestSort },
      featured: { isFeatured: -1, ...latestSort }
    };

    const [items, realTotal] = await Promise.all([
      queryLimit > 0
        ? Article.find(filter)
          .sort(sortMap[sort] || latestSort)
          .skip(skip)
          .limit(queryLimit)
          .lean()
        : Promise.resolve([]),
      Article.countDocuments(filter)
    ]);

    const total = Math.min(realTotal, MAX_LATEST_DISPLAY_ARTICLES);
    const totalPages = Math.max(Math.ceil(total / pageSize), total > 0 ? 1 : 0);

    res.json({
      success: true,
      data: items.map(normalizeArticle),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        pages: totalPages,
        realTotal,
        displayCap: MAX_LATEST_DISPLAY_ARTICLES,
        isCapped: realTotal > MAX_LATEST_DISPLAY_ARTICLES,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getArticleBySlug(req, res, next) {
  try {
    const key = req.params.slug;
    const filter = key.match(/^[0-9a-fA-F]{24}$/) ? { _id: key } : { slug: key };
    const article = await Article.findOne(filter).lean();
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    return res.json(normalizeArticle(article));
  } catch (error) {
    next(error);
  }
}

export async function incrementView(req, res, next) {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    return res.json({ views: article.views });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const [counts, riceCount] = await Promise.all([
      Article.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Article.countDocuments({ category: 'lua-gao', relevanceScore: { $gt: 0 } })
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    countMap['lua-gao'] = riceCount;

    const data = categoryDisplay.map((item) => ({ ...item, count: countMap[item.key] || 0 }));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedArticles(req, res, next) {
  req.query.featured = 'true';
  req.query.sort = req.query.sort || 'featured';
  req.query.limit = req.query.limit || 10;
  return getArticles(req, res, next);
}

export async function getLatestArticles(req, res, next) {
  req.query.sort = 'latest';
  req.query.limit = req.query.limit || 18;
  return getArticles(req, res, next);
}

export async function getStats(req, res, next) {
  try {
    const latestSort = { publishedAt: -1, fetchedAt: -1, createdAt: -1 };
    const [total, sources, newest, popular] = await Promise.all([
      Article.countDocuments(),
      Article.distinct('source'),
      Article.findOne().sort(latestSort).select('publishedAt title').lean(),
      Article.find().sort({ views: -1, ...latestSort }).limit(5).select('title slug views').lean()
    ]);

    res.json({
      total,
      sourceCount: sources.length,
      newest: newest ? normalizeArticle(newest) : newest,
      popular: popular.map(normalizeArticle)
    });
  } catch (error) {
    next(error);
  }
}
