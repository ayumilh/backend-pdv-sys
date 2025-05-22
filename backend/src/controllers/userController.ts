import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma/prismaClient";

interface UsuarioDecoded {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export const getAuthenticatedUser = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: usuario.id } });

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};
