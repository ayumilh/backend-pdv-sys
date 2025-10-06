import { Router } from "express";
import * as pedidoCompraController from "./pedidoCompra.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// CRUD básico de pedidos
router.post("/", pedidoCompraController.criarPedidoCompra);
router.get("/", pedidoCompraController.listarPedidosCompra);
router.get("/:id", pedidoCompraController.obterPedidoCompra);
router.put("/:id", pedidoCompraController.atualizarPedidoCompra);
router.delete("/:id", pedidoCompraController.deletarPedidoCompra);

// Itens e ações adicionais
router.post("/:id/item", pedidoCompraController.adicionarItemCompra);
router.delete("/:id/item/:itemId", pedidoCompraController.removerItemCompra);
router.post("/:id/finalizar", pedidoCompraController.finalizarPedidoCompra);

export default router;
