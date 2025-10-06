import { Request, Response, NextFunction } from "express";
import * as fornecedorService from "./fornecedor.service.js";

interface UsuarioDecoded {
  id: string;
  role: string;
  name: string;
}

export const listarFornecedores = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fornecedores = await fornecedorService.listarFornecedores();
    res.status(200).json(fornecedores);
  } catch (err) {
    next(err);
  }
};

export const buscarFornecedorPorId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const fornecedor = await fornecedorService.buscarFornecedorPorId(id);

    if (!fornecedor) {
      res.status(404).json({ message: "Fornecedor não encontrado." });
      return;
    }

    res.status(200).json(fornecedor);
  } catch (err) {
    next(err);
  }
};

export const criarFornecedor = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para criar fornecedor." });
      return;
    }

    const { name, cnpj, phone, email, address } = req.body;
    if (!name) {
      res.status(400).json({ message: "O campo nome é obrigatório." });
      return;
    }

    const fornecedor = await fornecedorService.criarFornecedor({
      name,
      cnpj,
      phone,
      email,
      address,
    });

    res.status(201).json(fornecedor);
  } catch (err) {
    next(err);
  }
};

export const atualizarFornecedor = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para atualizar fornecedor." });
      return;
    }

    const { id } = req.params;
    const { name, cnpj, phone, email, address } = req.body;

    const fornecedor = await fornecedorService.atualizarFornecedor(id, {
      name,
      cnpj,
      phone,
      email,
      address,
    });

    res.status(200).json(fornecedor);
  } catch (err) {
    next(err);
  }
};

export const deletarFornecedor = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || usuario.role !== "ADMIN") {
      res.status(403).json({ message: "Somente administradores podem excluir fornecedores." });
      return;
    }

    const { id } = req.params;
    const result = await fornecedorService.deletarFornecedor(id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
