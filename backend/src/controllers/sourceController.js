import FeedSource from '../models/FeedSource.js';

export async function getSources(req, res, next) {
  try {
    const sources = await FeedSource.find()
      .sort({ priority: -1, name: 1 })
      .select('-lastError')
      .lean();
    res.json(sources);
  } catch (error) {
    next(error);
  }
}

export async function createSource(req, res, next) {
  try {
    const {
      name,
      url,
      homepage = '',
      type = 'rss',
      category,
      language = 'vi',
      active = true,
      enabled = true,
      parserConfig = {},
      crawlFrequencyMinutes = 30,
      priority = 1
    } = req.body;
    if (!name || !url || !category) {
      return res.status(400).json({ message: 'Vui lòng nhập name, url và category.' });
    }

    const source = await FeedSource.create({
      name,
      url,
      homepage,
      type,
      category,
      language,
      active,
      enabled,
      parserConfig,
      crawlFrequencyMinutes,
      priority
    });
    return res.status(201).json(source);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Nguồn RSS này đã tồn tại.' });
    next(error);
  }
}

export async function updateSource(req, res, next) {
  try {
    const source = await FeedSource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!source) return res.status(404).json({ message: 'Không tìm thấy nguồn tin.' });
    return res.json(source);
  } catch (error) {
    next(error);
  }
}

export async function deleteSource(req, res, next) {
  try {
    const source = await FeedSource.findByIdAndDelete(req.params.id);
    if (!source) return res.status(404).json({ message: 'Không tìm thấy nguồn tin.' });
    return res.json({ message: 'Đã xóa nguồn tin.' });
  } catch (error) {
    next(error);
  }
}
