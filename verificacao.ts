// Script de verificação automatizada.
// Substitui o fetch global por um mock, para testar a lógica real dos
// services (validação, tratamento de status, mapeamento e erros) sem
// depender de acesso à internet.

import { AppError } from "./src/errors/AppError";
import * as enderecoService from "./src/services/enderecos.service";
import * as clientesService from "./src/services/clientes.service";

type Resultado = { nome: string; ok: boolean; detalhe: string };
const resultados: Resultado[] = [];

function registrar(nome: string, ok: boolean, detalhe: string) {
  resultados.push({ nome, ok, detalhe });
  console.log(`${ok ? "PASSOU" : "FALHOU"} - ${nome} -> ${detalhe}`);
}

// Mock simples do fetch global, simulando as respostas reais do ViaCEP.
function mockFetch(cenario: "sucesso" | "naoEncontrado" | "servicoFora") {
  (global as any).fetch = async (_url: string) => {
    if (cenario === "servicoFora") {
      throw new Error("Falha de rede simulada");
    }
    if (cenario === "naoEncontrado") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ erro: true }),
      } as any;
    }
    // sucesso
    return {
      ok: true,
      status: 200,
      json: async () => ({
        cep: "79002-000",
        logradouro: "Rua Example",
        bairro: "Centro",
        localidade: "Campo Grande",
        uf: "MS",
      }),
    } as any;
  };
}

async function rodarTestes() {
  // 1) CEP válido -> 200 + endereço
  mockFetch("sucesso");
  try {
    const endereco = await enderecoService.consultarCep("79002000");
    const ok =
      endereco.cep === "79002-000" &&
      endereco.rua === "Rua Example" &&
      endereco.cidade === "Campo Grande" &&
      endereco.estado === "MS";
    registrar("GET /enderecos/79002000 (CEP válido)", ok, `200 -> ${JSON.stringify(endereco)}`);
  } catch (e) {
    registrar("GET /enderecos/79002000 (CEP válido)", false, String(e));
  }

  // 2) CEP curto/inválido -> 400
  mockFetch("sucesso");
  try {
    await enderecoService.consultarCep("123");
    registrar("GET /enderecos/123 (CEP inválido)", false, "não lançou erro (esperado 400)");
  } catch (e) {
    const ok = e instanceof AppError && e.status === 400;
    registrar("GET /enderecos/123 (CEP inválido)", ok, `status ${(e as AppError).status} - "${(e as AppError).message}"`);
  }

  // 3) CEP inexistente -> 404
  mockFetch("naoEncontrado");
  try {
    await enderecoService.consultarCep("00000000");
    registrar("GET /enderecos/00000000 (CEP inexistente)", false, "não lançou erro (esperado 404)");
  } catch (e) {
    const ok = e instanceof AppError && e.status === 404;
    registrar("GET /enderecos/00000000 (CEP inexistente)", ok, `status ${(e as AppError).status} - "${(e as AppError).message}"`);
  }

  // 4) Serviço externo fora do ar -> 502
  mockFetch("servicoFora");
  try {
    await enderecoService.consultarCep("79002000");
    registrar("GET /enderecos/79002000 (serviço externo fora)", false, "não lançou erro (esperado 502)");
  } catch (e) {
    const ok = e instanceof AppError && e.status === 502;
    registrar("GET /enderecos/79002000 (serviço externo fora)", ok, `status ${(e as AppError).status} - "${(e as AppError).message}"`);
  }

  // 5) POST /clientes com dados válidos -> 201 (cliente com endereço)
  mockFetch("sucesso");
  try {
    const cliente = await clientesService.cadastrarCliente({
      nome: "Maria Silva",
      email: "maria@email.com",
      cep: "79002000",
    });
    const ok = cliente.id === 1 && cliente.nome === "Maria Silva" && cliente.endereco.cidade === "Campo Grande";
    registrar("POST /clientes (dados válidos)", ok, `201 -> ${JSON.stringify(cliente)}`);
  } catch (e) {
    registrar("POST /clientes (dados válidos)", false, String(e));
  }

  // 6) POST /clientes sem nome -> 400
  mockFetch("sucesso");
  try {
    await clientesService.cadastrarCliente({ email: "x@x.com", cep: "79002000" });
    registrar("POST /clientes (nome vazio)", false, "não lançou erro (esperado 400)");
  } catch (e) {
    const ok = e instanceof AppError && e.status === 400;
    registrar("POST /clientes (nome vazio)", ok, `status ${(e as AppError).status} - "${(e as AppError).message}"`);
  }

  // 7) GET /clientes -> 200 + array (deve conter o cliente cadastrado no teste 5)
  const clientes = clientesService.listarClientes();
  const ok7 = Array.isArray(clientes) && clientes.length === 1;
  registrar("GET /clientes (listagem)", ok7, `200 -> array com ${clientes.length} cliente(s)`);

  console.log("\nResumo:");
  const totalOk = resultados.filter((r) => r.ok).length;
  console.log(`${totalOk}/${resultados.length} testes passaram.`);
}

rodarTestes();
