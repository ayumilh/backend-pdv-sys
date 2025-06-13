import { Router } from 'express';
import * as cashController from './cash.controller';
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/open', cashController.abrirCaixa);
router.post('/close', cashController.fecharCaixa);
router.post('/venda', cashController.registrarVenda);
router.post('/transacao', cashController.registrarTransacao);
router.get('/resumo/:registerId', cashController.getResumoCaixa);

export default router;
