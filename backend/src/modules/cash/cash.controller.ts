import { Request, Response, NextFunction } from 'express';
import * as cashService from './cash.service';

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
      return
    }

    const venda = await cashService.registrarVenda(userId, clientId, items, payments);
    res.status(201).json(venda);
    return;
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
