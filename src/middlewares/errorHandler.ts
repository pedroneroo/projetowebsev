import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

// Middleware central de tratamento de erros.
// Transforma qualquer erro lançado (AppError ou não) em uma resposta
// HTTP + JSON padronizada, sem vazar detalhes técnicos para o cliente.
export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return response.status(error.status).json({ mensagem: error.message });
  }

  console.error(error);
  return response
    .status(500)
    .json({ mensagem: "Erro interno no servidor" });
}
