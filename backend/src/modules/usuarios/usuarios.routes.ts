import { Router } from 'express';
import {
    userController
} from './usuarios.controller';

const router = Router();

router.post('/', userController.create);
router.put('/:id', userController.update);
router.get('/:id/movements', userController.getMovimentacoes);

router.get('/', userController.getAll);


export default router;
