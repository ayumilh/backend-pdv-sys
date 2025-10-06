import { Request, Response, NextFunction } from 'express';
import * as cashService from './cash.service.js';
import * as stockService from '../stock/stock.service.js';

interface UsuarioDecoded {
  id: string;
  role: string;
}

export const abrirCaixa = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const { openingAmount } = req.body;
    const userId = req.usuario?.id;

    if (!userId || typeof openingAmount !== 'number') {
      res.status(400).json({ message: 'Dados inválidos.' });
      return;
    }

    const data = await cashService.abrirCaixa(userId, openingAmount);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const fecharCaixa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registerId, closingAmount } = req.body;

    const data = await cashService.fecharCaixa(registerId, closingAmount);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const registrarVenda = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId, items, payments } = req.body;
    const userId = req.usuario?.id;

    if (!userId || !Array.isArray(items) || !Array.isArray(payments)) {
      res.status(400).json({ message: 'Dados inválidos.' });
      return;
    }

    // 1️⃣ Registrar venda no caixa (função abaixo já trata FIADO)
    const venda = await cashService.registrarVenda(userId, clientId, items, payments);

    // 2️⃣ Ajustar estoque automaticamente (saída por VENDA)
    for (const item of items) {
      await stockService.createMovement({
        productId: item.productId,
        quantity: item.quantity,
        type: 'VENDA',
        userId
      });
    }

    res.status(201).json(venda);
  } catch (err) {
    next(err);
  }
};

export const registrarTransacao = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registerId, type, amount, description } = req.body;

    const transacao = await cashService.registrarTransacao(registerId, type, amount, description);
    res.status(201).json(transacao);
    return;
  } catch (err) {
    next(err);
  }
};

export const getResumoCaixa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumo = await cashService.getResumoCaixa(req.params.registerId);
    res.json(resumo);
    return;
  } catch (err) {
    next(err);
  }
};


export const cancelarVenda = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params;
    const userRole = req.usuario?.role; // middleware authMiddleware deve popular req.user

    const result = await cashService.cancelarVenda(saleId, userRole);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelarItem = async (
  req: Request & { usuario?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { saleId, itemId } = req.params;
    const userRole = req.usuario?.role;

    if (!userRole) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    const result = await cashService.cancelarItemVenda({
      saleId,
      saleItemId: itemId,
      userRole
    });

    res.status(200).json(result);
    return;
  } catch (err: any) {
    next(err);
  }
};