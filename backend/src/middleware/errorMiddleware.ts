import { Request, Response, NextFunction } from "express";

// Middleware de erro
const errorMiddleware = (
  err: any,   // Pode ser qualquer tipo de erro
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {  // Alterado para void
  console.error(err);  // Log do erro no servidor

  // Verifica se o erro possui um status customizado
  const statusCode = err.statusCode || 500;
  const message = err.message || "Erro inesperado no servidor";

  // Envia a resposta de erro para o cliente
  res.status(statusCode).json({
    message,  // Mensagem do erro
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Apenas no modo de desenvolvimento
  });
};

export default errorMiddleware;
