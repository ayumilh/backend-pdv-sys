import { Request, Response, NextFunction } from "express";
import * as pedidoCompraService from "./pedidoCompra.services.js";

interface UsuarioDecoded {
  id: string;
  role: string;
  name: string;
}

// ✅ Criar pedido de compra
export const criarPedidoCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para criar pedidos de compra." });
      return;
    }

    const { fornecedorId, numeroNota, valorTotal } = req.body;
    if (!fornecedorId) {
      res.status(400).json({ message: "Fornecedor é obrigatório." });
      return;
    }

    const pedido = await pedidoCompraService.criarPedidoCompra({
      fornecedorId,
      appUserId: usuario.id,
      numeroNota,
      valorTotal,
    });

    res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
};

// ✅ Listar pedidos
export const listarPedidosCompra = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pedidos = await pedidoCompraService.listarPedidosCompra();
    res.status(200).json(pedidos);
  } catch (err) {
    next(err);
  }
};

// ✅ Obter pedido
export const obterPedidoCompra = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pedido = await pedidoCompraService.obterPedidoCompra(req.params.id);
    if (!pedido) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.status(200).json(pedido);
  } catch (err) {
    next(err);
  }
};

// ✅ Atualizar pedido
export const atualizarPedidoCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;
    if (!usuario || usuario.role !== "ADMIN") {
      res.status(403).json({ message: "Apenas administradores podem editar pedidos." });
      return;
    }

    const pedido = await pedidoCompraService.atualizarPedidoCompra(req.params.id, req.body);
    res.status(200).json(pedido);
  } catch (err) {
    next(err);
  }
};

// ✅ Deletar pedido
export const deletarPedidoCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;
    if (!usuario || usuario.role !== "ADMIN") {
      res.status(403).json({ message: "Apenas administradores podem excluir pedidos." });
      return;
    }

    const result = await pedidoCompraService.deletarPedidoCompra(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Adicionar item
export const adicionarItemCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;
    if (!usuario) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    const { id } = req.params;
    const { productId, quantity, unitCost } = req.body;

    if (!productId || !quantity || !unitCost) {
      res.status(400).json({ message: "Campos obrigatórios ausentes." });
      return;
    }

    const item = await pedidoCompraService.adicionarItemCompra({
      pedidoCompraId: id,
      productId,
      quantity,
      unitCost,
      userId: usuario.id,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// ✅ Remover item
export const removerItemCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, itemId } = req.params;
    const usuario = req.usuario;
    if (!usuario) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    const result = await pedidoCompraService.removerItemCompra(id, itemId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Finalizar pedido (gera lotes automaticamente)
export const finalizarPedidoCompra = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;
    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Sem permissão para finalizar pedidos." });
      return;
    }

    const { id } = req.params;
    const { gerarLotes } = req.body;

    const result = await pedidoCompraService.finalizarPedidoCompra(id, usuario.id, gerarLotes);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
