import { Router } from "express";
import * as fornecedorController from "./fornecedor.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", fornecedorController.listarFornecedores);
router.get("/:id", fornecedorController.buscarFornecedorPorId);
router.post("/", fornecedorController.criarFornecedor);
router.put("/:id", fornecedorController.atualizarFornecedor);
router.delete("/:id", fornecedorController.deletarFornecedor);

export default router;
