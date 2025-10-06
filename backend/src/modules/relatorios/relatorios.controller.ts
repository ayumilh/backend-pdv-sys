import { Request, Response, NextFunction } from "express";
import * as relatoriosService from "./relatorios.service.js";

interface UsuarioDecoded {
  id: string;
  role: string;
  name: string;
}

// ✅ Vendas
export const relatoriosVendas = async (
  req: Request & { usuario?: UsuarioDecoded },
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataInicio, dataFim, userId, productId } = req.query;
    const result = await relatoriosService.relatoriosVendas({
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      userId: userId as string,
      productId: productId as string,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Estoque
export const relatoriosEstoque = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await relatoriosService.relatoriosEstoque();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Compras
export const relatoriosCompras = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataInicio, dataFim, fornecedorId } = req.query;
    const result = await relatoriosService.relatoriosCompras({
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      fornecedorId: fornecedorId as string,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ✅ Fornecedores
export const relatoriosFornecedores = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await relatoriosService.relatoriosFornecedores();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
