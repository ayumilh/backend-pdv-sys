import { Request, Response, NextFunction } from "express";
import * as loteProdutoService from "./loteProduto.service.js";

interface UsuarioDecoded {
  id: string;
  role: string;
  name: string;
}

// ✅ Criar novo lote
export const criarLote = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para criar lotes." });
      return;
    }

    const { productId, batchNumber, quantity, expirationDate } = req.body;
    if (!productId || !batchNumber || !quantity) {
      res.status(400).json({ message: "Campos obrigatórios ausentes." });
      return;
    }

    const lote = await loteProdutoService.criarLote({
      productId,
      batchNumber,
      quantity,
      expirationDate,
      userId: usuario.id,
    });

    res.status(201).json(lote);
  } catch (err) {
    next(err);
  }
};

// ✅ Listar todos os lotes
export const listarLotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lotes = await loteProdutoService.listarLotes();
    res.status(200).json(lotes);
  } catch (err) {
    next(err);
  }
};

// ✅ Obter lote específico
export const obterLote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lote = await loteProdutoService.obterLote(req.params.id);
    if (!lote) {
      res.status(404).json({ message: "Lote não encontrado." });
      return;
    }
    res.status(200).json(lote);
  } catch (err) {
    next(err);
  }
};

// ✅ Atualizar lote
export const atualizarLote = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para editar lotes." });
      return;
    }

    const { id } = req.params;
    const { batchNumber, quantity, expirationDate } = req.body;

    const lote = await loteProdutoService.atualizarLote(id, {
      batchNumber,
      quantity,
      expirationDate,
      userId: usuario.id,
    });

    res.status(200).json(lote);
  } catch (err) {
    next(err);
  }
};

// ✅ Deletar lote
export const deletarLote = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    if (!usuario || usuario.role !== "ADMIN") {
      res.status(403).json({ message: "Somente administradores podem deletar lotes." });
      return;
    }

    const { id } = req.params;
    const result = await loteProdutoService.deletarLote(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Listar lotes de um produto
export const listarLotesPorProduto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const lotes = await loteProdutoService.listarLotesPorProduto(productId);
    res.status(200).json(lotes);
  } catch (err) {
    next(err);
  }
};

// ✅ Ajustar quantidade manualmente
export const ajustarQuantidade = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;
    const { id } = req.params;
    const { quantidade } = req.body;

    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para ajustar quantidade." });
      return;
    }

    const result = await loteProdutoService.ajustarQuantidade(id, quantidade, usuario.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
