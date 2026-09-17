import { AppError } from "../errors/AppError";
import { Endereco } from "../types/viaCep";
import { consultarCep } from "./enderecos.service";

export type Cliente = {
  id: number;
  nome: string;
  email: string;
  endereco: Endereco;
};

// "Banco de dados" simples em memória, só para fins didáticos.
const clientes: Cliente[] = [];
let proximoId = 1;

type DadosNovoCliente = {
  nome?: string;
  email?: string;
  cep?: string;
};

// Cadastra um cliente novo, usando o CEP informado para montar o endereço
// através da API externa (ViaCEP). É aqui que a "nossa API vira cliente
// de outra API" para completar a operação.
export async function cadastrarCliente(dados: DadosNovoCliente): Promise<Cliente> {
  const { nome, email, cep } = dados;

  if (!nome || nome.trim().length === 0) {
    throw new AppError("Nome obrigatório", 400);
  }

  if (!email || email.trim().length === 0) {
    throw new AppError("Email obrigatório", 400);
  }

  if (!cep) {
    throw new AppError("CEP obrigatório", 400);
  }

  // Reaproveita a service de endereços: valida o CEP e consulta o serviço externo.
  const endereco = await consultarCep(cep);

  const novoCliente: Cliente = {
    id: proximoId++,
    nome: nome.trim(),
    email: email.trim(),
    endereco,
  };

  clientes.push(novoCliente);
  return novoCliente;
}

export function listarClientes(): Cliente[] {
  return clientes;
}
