import { Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "./authMiddleware";

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.usuario?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Acesso negado. Permissão insuficiente." });
      return;
    }

    next();
  };
}
