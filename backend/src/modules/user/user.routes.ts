import { Router } from "express";
import { authMiddleware } from "@/shared/middleware/authMiddleware";
import { getAuthenticatedUser } from "./user.controller";

const router = Router();

// Rota protegida
router.get("/me", authMiddleware, getAuthenticatedUser);

export default router;
