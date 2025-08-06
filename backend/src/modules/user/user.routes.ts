import { Router } from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { getAuthenticatedUser } from "./user.controller.js";

const router = Router();

// Rota protegida
router.get("/me", authMiddleware, getAuthenticatedUser);

export default router;
