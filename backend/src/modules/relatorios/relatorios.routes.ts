import { Router } from "express";
import * as relatoriosController from "./relatorios.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Relatórios gerais
router.get("/dashboard", relatoriosController.dashboardResumo);
router.get("/vendas", relatoriosController.relatoriosVendas);
router.get("/estoque", relatoriosController.relatoriosEstoque);
router.get("/compras", relatoriosController.relatoriosCompras);
router.get("/fornecedores", relatoriosController.relatoriosFornecedores);

export default router;
