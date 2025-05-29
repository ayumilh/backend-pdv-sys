import { Router } from 'express';
import * as stockController from './stock.controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', stockController.listMovements);
router.get('/:id', stockController.getMovementById);
router.post('/', stockController.createMovement);

export default router;
