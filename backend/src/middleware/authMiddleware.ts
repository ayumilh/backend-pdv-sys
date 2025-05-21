import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const secretKey = process.env.JWT_SECRET as string;

interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

// Extensão do tipo Request para incluir o usuário autenticado
export interface AuthenticatedRequest extends Request {
  usuario?: DecodedToken;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next({ statusCode: 401, message: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    req.usuario = decoded;
    next();
  } catch (error) {
    return next({ statusCode: 401, message: "Token inválido." });
  }
};

export default authMiddleware;
