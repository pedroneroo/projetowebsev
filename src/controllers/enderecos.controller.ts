import { NextFunction, Request, Response } from "express";
import * as enderecoService from "../services/enderecos.service";

// GET /enderecos/:cep
// O controller só cuida de HTTP: lê o parâmetro, chama a service e devolve JSON.
// Toda a regra de integração com o ViaCEP fica escondida na service.
export async function buscarEndereco(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const { cep } = request.params;
    const endereco = await enderecoService.consultarCep(cep);
    return response.status(200).json(endereco);
  } catch (error) {
    next(error);
  }
}
