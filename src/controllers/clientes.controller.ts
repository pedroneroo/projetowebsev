import { NextFunction, Request, Response } from "express";
import * as clientesService from "../services/clientes.service";

// POST /clientes
// Recebe { nome, email, cep }, usa o CEP para montar o endereço (via service)
// e devolve o cliente já cadastrado com endereço completo.
export async function criarCliente(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const cliente = await clientesService.cadastrarCliente(request.body);
    return response.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
}

// GET /clientes
export async function listarClientes(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const clientes = clientesService.listarClientes();
    return response.status(200).json(clientes);
  } catch (error) {
    next(error);
  }
}
