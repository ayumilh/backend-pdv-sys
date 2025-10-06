// fiado.routes.ts
import { Router } from 'express';
import * as fiadoController from './fiado.controller.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.post('/', fiadoController.registrarFiado);
router.get('/', fiadoController.listarFiados);
router.get('/:clienteId', fiadoController.listarFiadosCliente);
router.put('/:id/pagar', fiadoController.pagarFiado);

export default router;
