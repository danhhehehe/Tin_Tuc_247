import { Router } from 'express';
import { createSource, deleteSource, getSources, updateSource } from '../controllers/sourceController.js';

const router = Router();

router.get('/', getSources);
router.post('/', createSource);
router.patch('/:id', updateSource);
router.delete('/:id', deleteSource);

export default router;
