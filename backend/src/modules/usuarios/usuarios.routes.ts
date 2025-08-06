import { Router } from 'express';
import {
    userController
} from './usuarios.controller.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', userController.create);
router.put('/:id', userController.update);
router.get('/:id/movements', userController.getMovimentacoes);

router.get('/', userController.getAll);

router.delete('/:id', userController.delete);
router.get('/:id', userController.getById);


router.post('/verificar-email', userController.checkEmailExists);


export default router;
