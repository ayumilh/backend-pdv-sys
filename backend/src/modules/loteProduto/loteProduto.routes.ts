import { Router } from "express";
import * as loteProdutoController from "./loteProduto.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// CRUD principal
router.post("/", loteProdutoController.criarLote);
router.get("/", loteProdutoController.listarLotes);
router.get("/:id", loteProdutoController.obterLote);
router.put("/:id", loteProdutoController.atualizarLote);
router.delete("/:id", loteProdutoController.deletarLote);

// Filtros e ações extras
router.get("/produto/:productId", loteProdutoController.listarLotesPorProduto);
router.post("/:id/ajustar", loteProdutoController.ajustarQuantidade);

export default router;
