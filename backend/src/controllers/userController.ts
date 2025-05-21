import { Request, Response, NextFunction } from "express";
import { prisma } from "@/prisma/prismaClient";
import { AuthenticatedRequest } from "@/middleware/authMiddleware";

export const getAuthenticatedUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.usuario?.id;

    if (!userId) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    console.log("Usuário autenticado:", user);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário da sessão:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};

