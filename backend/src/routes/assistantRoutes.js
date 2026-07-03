import { Router } from 'express';
import { assistantChat, assistantSearch, assistantStatus } from '../controllers/assistantController.js';

const router = Router();

router.get('/status', assistantStatus);
router.post('/search', assistantSearch);
router.post('/chat', assistantChat);

export default router;
