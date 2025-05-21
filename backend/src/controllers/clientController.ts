import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma/prismaClient"; // Ajuste o caminho conforme necessário

// Criar um novo cliente
export const createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, cpf, phone } = req.body;

    if (!name) {
      return next({ statusCode: 400, message: "Nome do cliente é obrigatório." });
    }

    const existingClient = cpf
      ? await prisma.client.findUnique({ where: { cpf } })
      : null;

    if (existingClient) {
      return next({ statusCode: 409, message: "Já existe um cliente com esse CPF." });
    }

    const client = await prisma.client.create({
      data: { name, cpf, phone },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    next(error);
  }
};

// Listar todos os clientes
export const getAllClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    next(error);
  }
};

// Buscar cliente por ID
export const getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return next({ statusCode: 404, message: "Cliente não encontrado." });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    next(error);
  }
};

// Atualizar cliente
export const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { name, cpf, phone } = req.body;

  try {
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return next({ statusCode: 404, message: "Cliente não encontrado." });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, cpf, phone },
    });

    res.status(200).json(updatedClient);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    next(error);
  }
};

// Deletar cliente
export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return next({ statusCode: 404, message: "Cliente não encontrado." });
    }

    await prisma.client.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    next(error);
  }
};
