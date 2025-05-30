import { Router } from 'express';
import * as controller from './category.controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware); // Apply auth middleware to all routes

router.get('/', controller.list);
// router.get('/:id', authMiddleware, controller.get);
router.post('/', controller.createCategory);
router.put('/:id', controller.update);

export default router;
