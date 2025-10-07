import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service.js';


export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Categoria não encontrada' });
      return;
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    // Só ADMIN pode criar categoria
    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ message: "Você não tem permissão para criar categorias." });
      return;
    }

    const { name } = req.body;

    // Validação simples do campo obrigatório
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ message: "O campo 'name' é obrigatório e deve ser uma string não vazia." });
      return;
    }

    // Criar categoria
    const newCategory = await categoryService.createCategory({ name: name.trim() });

    res.status(201).json(newCategory);

  } catch (error: any) {
    // Tratamento para erro de unique constraint
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(400).json({ message: "Categoria com esse nome já existe." });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};


export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};