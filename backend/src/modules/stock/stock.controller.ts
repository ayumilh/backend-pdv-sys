import { Request, Response, NextFunction } from 'express';
import * as stockService from './stock.service';

interface UsuarioDecoded {
  id: string;
  name: string;
  email?: string;
  role: string;
}


export const listMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await stockService.getAllMovements();
    res.json(movements);
  } catch (error) {
    next(error);
  }
};

export const getMovementById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movement = await stockService.getMovementById(req.params.id);
    if (!movement) {
      res.status(404).json({ message: 'Movimentação não encontrada' });
      return;
    }
    res.json(movement);
  } catch (error) {
    next(error);
  }
};

export const createMovement = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== 'ADMIN' && usuario.role !== 'ESTOQUISTA')) {
      res.status(403).json({ message: 'Sem permissão para criar movimentação.' });
      return;
    }

    const { productId, quantity, type } = req.body;

    if (!productId || quantity == null || !type) {
      res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
      return;
    }

    if (!['ENTRADA', 'SAIDA', 'AJUSTE'].includes(type)) {
      res.status(400).json({ message: 'Tipo inválido de movimentação.' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
      return;
    }

    const movement = await stockService.createMovement({
      productId,
      quantity,
      type,
      userId: usuario.id,
    });

    res.status(201).json(movement);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};
