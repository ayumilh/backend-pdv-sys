import { Router } from 'express';
import * as controller from './category.controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, controller.list);
// router.get('/:id', authMiddleware, controller.get);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);

export default router;
