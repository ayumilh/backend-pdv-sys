import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err); // Loga o erro para análise no backend

  // Se o erro já tem um status definido (ex: 400), usa ele; se não, 500 (erro interno)
  const status = err.status || 500;

  // Mensagem clara, padrão para erros inesperados
  const message =
    err.message || "Ocorreu um erro inesperado no servidor.";

  res.status(status).json({
    error: true,
    message,
  });
}
