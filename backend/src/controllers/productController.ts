import { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService";

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

    console.log("Usuario:", usuario);

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

// Cria produto
export const createProduct = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const usuario = req.usuario;

    if (!usuario || (usuario.role !== "ADMIN" && usuario.role !== "ESTOQUISTA")) {
      res.status(403).json({ message: "Você não tem permissão para criar produtos." });
      return;
    }

    const { name, price, stock, barcode, imageUrl, weight } = req.body;

    if (!name || price == null || stock == null) {
      res.status(400).json({ message: "Campos obrigatórios ausentes." });
      return;
    }

    const newProduct = await productService.createProduct({
      name,
      price,
      stock,
      barcode,
      imageUrl,
      weight,
    });

    res.status(201).json(newProduct);
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
