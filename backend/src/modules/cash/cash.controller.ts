import { Request, Response, NextFunction } from 'express';
import * as cashService from './cash.service.js';
import * as stockService from '../stock/stock.service.js';

export const abrirCaixa = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { openingAmount } = req.body;
    const userId = req.user?.id;

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

// 3. Verificar se o Caixa está Aberto
export const checkCaixaAberto = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(400).json({ message: 'ID do usuário não fornecido.' });
      return;
    }

    // Verifica se o caixa está aberto
    const result = await cashService.checkCaixaAberto(req.user.id);
    console.log('Resultado da verificação do caixa:', result); // Log do resultado
    if (result) {
      res.json({ aberto: true });
    } else {
      res.json({ aberto: false });
    }
  } catch (error) {
    console.error('Erro ao verificar caixa:', error);
    next(error);
  }
};
// Obtém o último valor de abertura do caixa
export const getUltimoValorAbertura = async (  req: Request & { user?: { id: string; role: string } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: 'ID do usuário não fornecido.' });
      return;
    }
    const lastAmount = await cashService.getUltimoValorAbertura(userId);
    res.json({ lastAmount });
  } catch (error) {
    console.error('Erro ao buscar último valor de abertura:', error);
    next(error);
  }
};

export const registrarVenda = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId, items, payments } = req.body;
    const userId = req.user?.id;

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
  req: Request & { user?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { saleId, itemId } = req.params;
    const userRole = req.user?.role;

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