import express from "express";
import { login, register } from "./auth.controller"; // Corrija o caminho conforme necessário"

const router = express.Router();

// Rota de login
router.post("/login", login);

router.post("/register", register);

export default router;
