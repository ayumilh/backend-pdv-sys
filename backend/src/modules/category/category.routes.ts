import { Router } from 'express';
import * as controller from './category.controller.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', controller.list);
// router.get('/:id', authMiddleware, controller.get);
router.post('/', controller.createCategory);
router.put('/:id', controller.update);

export default router;
