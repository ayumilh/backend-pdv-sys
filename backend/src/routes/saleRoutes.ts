import { Router } from "express";
import { createSale, getAllSales, getSaleById } from "@/controllers/saleController"; // Corrija o caminho conforme necessário
const router = Router();

// Definindo as rotas de vendas
router.post("/sales", createSale); // Rota para criar uma nova venda, protegida por authMiddleware
router.get("/sales", getAllSales); // Rota para listar todas as vendas, protegida por authMiddleware
router.get("/sales/:id",  getSaleById); // Rota para buscar uma venda por ID, protegida por authMiddleware

export default router;
