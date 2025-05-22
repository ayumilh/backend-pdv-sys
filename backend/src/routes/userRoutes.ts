import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware";
import { getAuthenticatedUser } from "@/controllers/userController";

const router = Router();

// Rota protegida
router.get("/me", authMiddleware, getAuthenticatedUser);

export default router;
