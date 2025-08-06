import { Request, Response, NextFunction } from "express";
import * as productService from "./product.service.js";
import * as stockService from "../stock/stock.service.js";

interface UsuarioDecoded {
  id: string;
  name: string;
  email?: string;
  role: string;
}

// Lista produtos
export const listProducts = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA" && usuario.role !== "CAIXA")) {
      res.status(403).json({ message: "Você não tem permissão para visualizar produtos." });
      return;
    }

    const { categoryId, search } = req.query;
    const products = await productService.listProducts(categoryId as string, search as string);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get único produto
export const getProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(403).json({ message: "Você não tem permissão para visualizar produtos." });
      return;
    }

    const product = await productService.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== 'ADMIN' && usuario.role !== 'ESTOQUISTA')) {
      res.status(403).json({ message: 'Você não tem permissão para criar produtos.' });
      return
    }

    const { name, price, stock, barcode, imageUrl, weight } = req.body;

    if (!name || price == null || stock == null) {
      res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
      return;
    }

    const newProduct = await productService.createProduct({
      name,
      price,
      stock,
      barcode,
      imageUrl,
      weight,
      userId: usuario.id,
    });

    res.status(201).json(newProduct);
    return;
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const createMovementForProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== 'ADMIN' && usuario.role !== 'ESTOQUISTA')) {
      res.status(403).json({ message: 'Sem permissão para movimentar estoque.' });
      return;
    }

    const { quantity, type } = req.body;
    const productId = req.params.id;

    if (!quantity || !type) {
      res.status(400).json({ message: 'Quantidade e tipo são obrigatórios.' });
      return;
    }


    const movement = await stockService.createMovement({
      productId,
      quantity,
      type,
      userId: usuario.id,
    });

    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

export const getMovementsByProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    const movements = await stockService.getMovementsByProduct(productId);
    res.json(movements);
  } catch (error) {
    next(error);
  }
};


// Atualiza produto
export const updateProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Você não tem permissão para atualizar produtos." });
      return;
    }

    const updated = await productService.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Deleta produto
export const deleteProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Você não tem permissão para deletar produtos." });
      return;
    }

    const { id } = req.params;
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ message: "Produto não encontrado ou já deletado." });
      return;
    }

    res.status(200).json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    next(error);
  }
};