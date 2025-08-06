import { Router } from 'express';
import * as stockController from './stock.controller.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', stockController.listMovements);
router.get('/:id', stockController.getMovementById);
router.post('/', stockController.createMovement);
router.delete('/:id', stockController.deleteMovement);

export default router;
