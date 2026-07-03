import { Router } from 'express';
import {
  getArticleBySlug,
  getArticles,
  getCategories,
  getFeaturedArticles,
  getLatestArticles,
  getStats,
  incrementView
} from '../controllers/articleController.js';

const router = Router();

router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/latest', getLatestArticles);
router.get('/categories/list', getCategories);
router.get('/stats/overview', getStats);
router.get('/:slug', getArticleBySlug);
router.post('/:id/view', incrementView);

export default router;
