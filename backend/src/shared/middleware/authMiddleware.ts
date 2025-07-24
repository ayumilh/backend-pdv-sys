import { Request, Response, NextFunction } from "express";
import { prisma } from '../../../prisma/prismaClient';

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
      return res.status(401).json({ error: "Token de sessão ausente." });
    }

    // Busca a sessão no banco pelo token
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || !session.userId) {
      return res.status(401).json({ error: "Sessão inválida ou expirada." });
    }

    // Busca o usuário associado à sessão
    const user = await prisma.appUser.findUnique({
      where: { userId: session.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Anexa dados mínimos ao req.user
    req.user = {
      id: user.id,
      role: user.role,
      userId: user.userId, // Adiciona o userId para compatibilidade
    };
    console.log("Usuário autenticado:", req.user);

    next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return res.status(500).json({ error: "Erro interno de autenticação." });
  }
}

export const authMiddleware = authenticate;