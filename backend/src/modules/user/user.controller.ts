// src/modules/userauth/userController.ts
import { Request, Response, NextFunction } from "express";
import pool from "../../../bd.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    userId?: string;
  };
}

export async function getAuthenticatedUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const { id, role, userId } = req.user;

    const result = await pool.query(
      `SELECT name, email FROM "user" WHERE id = $1 LIMIT 1`,
      [userId]
    );

    const perfil = result.rows[0];

    if (!perfil) {
      res.status(404).json({ error: "Perfil do usuário não encontrado." });
      return;
    }

    res.status(200).json({
      id,
      role,
      name: perfil.name,
      email: perfil.email,
    });
  } catch (err) {
    next(err);
  }
}
