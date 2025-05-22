import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const secretKey = process.env.JWT_SECRET as string;

interface TokenPayload {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

// Solução correta aqui
export const authMiddleware = (
  req: Request & { usuario?: TokenPayload }, // 👈 AQUI
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey) as TokenPayload;
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido." });
  }
};
