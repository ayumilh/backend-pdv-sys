// src/modules/userauth/userController.ts
import { Request, Response, NextFunction } from "express"
import { prisma } from "../../../prisma/prismaClient"

interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    userId?: string
  }
}

export async function getAuthenticatedUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado." })
      return
    }

    const { id, role, userId } = req.user

    const perfil = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    if (!perfil) {
      res.status(404).json({ error: "Perfil do usuário não encontrado." })
      return
    }

    // Apenas chama o json, não retorna o resultado dele
    res.status(200).json({
      id,
      role,
      name: perfil.name,
      email: perfil.email,
    })
    return
  } catch (err) {
    next(err)
  }
}
