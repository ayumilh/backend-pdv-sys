import { Router } from 'express';
import * as cashController from './cash.controller.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/open', cashController.abrirCaixa);
router.post('/close', cashController.fecharCaixa);
router.post('/venda', cashController.registrarVenda);

// Rota para verificar se o caixa está aberto
router.get('/check-open', cashController.checkCaixaAberto);

// Rota para obter o último valor de abertura
router.get('/last-opening', cashController.getUltimoValorAbertura);

router.post('/transacao', cashController.registrarTransacao);
router.get('/resumo/:registerId', cashController.getResumoCaixa);
router.post('/cancel/:saleId', cashController.cancelarVenda);
router.delete('/cancel/:saleId/item/:itemId', cashController.cancelarItem);

export default router;
