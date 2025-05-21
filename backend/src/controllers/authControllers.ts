import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { prisma } from "@/prisma/prismaClient";

dotenv.config();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, password, role, storeId } = req.body;

  try {
    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next({
        statusCode: 409,
        message: "Email já está em uso.",
      });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        storeId, // Pode ser nulo se o usuário não pertencer a uma loja específica
      },
    });

    // Passando a resposta via next(), caso tenha algum middleware específico para tratamento
    return next({
      statusCode: 201,  // Criado com sucesso
      message: "Usuário registrado com sucesso.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        storeId: newUser.storeId,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return next({
      statusCode: 500,  // Erro interno
      message: "Erro interno no servidor.",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Credenciais inválidas" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Credenciais inválidas" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: "Chave secreta JWT não configurada" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, storeId: user.storeId },
      jwtSecret,
      { expiresIn: "8h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 8,
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
        token,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};
