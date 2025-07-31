import { Request, Response, NextFunction } from "express";
import pool from "../../../bd";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    userId?: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extrai o token do cookie better-auth.session_token
    const cookieHeader = req.headers.cookie || "";
    const tokenRaw = cookieHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("better-auth.session_token="));
    const token = tokenRaw?.split("=")[1]?.split(".")[0];

    if (!token) {
      res.status(401).json({ error: "Token de sessão ausente." });
      return;
    }

    // Busca a sessão no banco
    const sessionResult = await pool.query(
      `SELECT * FROM session WHERE token = $1 LIMIT 1`,
      [token]
    );
    const session = sessionResult.rows[0];

    if (!session || !session.userId) {
      res.status(401).json({ error: "Sessão inválida ou expirada." });
      return
    }

    // Busca o AppUser correspondente
    const appUserResult = await pool.query(
      `SELECT * FROM "AppUser" WHERE "userId" = $1 LIMIT 1`,
      [session.userId]
    );
    const user = appUserResult.rows[0];

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Anexa dados mínimos ao req.user
    req.user = {
      id: user.id,
      role: user.role,
      userId: user.userId, // Adiciona o userId para compatibilidade
    };
    next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(500).json({ error: "Erro interno de autenticação." });
    return;
  }
}

export const authMiddleware = authenticate;