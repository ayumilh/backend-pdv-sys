import { Request, Response, NextFunction } from 'express';
import * as stockService from './stock.service';

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

export const createMovement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = (req as any).usuario;

    if (!usuario || (usuario.role !== 'ADMIN' && usuario.role !== 'ESTOQUISTA')) {
      res.status(403).json({ message: 'Sem permissão para criar movimentação.' });
      return
    }

    const movement = await stockService.createMovement({
      productId: req.body.productId,
      quantity: req.body.quantity,
      type: req.body.type,
      userId: usuario.id,
    });

    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};
