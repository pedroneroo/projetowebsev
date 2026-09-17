import { AppError } from "../errors/AppError";
import { Endereco, ViaCepResponse } from "../types/viaCep";

// Valida o formato do CEP antes de gastar uma chamada HTTP externa.
// Regra: precisa ter exatamente 8 dígitos numéricos (com ou sem hífen).
export function validarCep(cep: string): string {
  const apenasNumeros = cep.replace("-", "").trim();

  if (!/^\d{8}$/.test(apenasNumeros)) {
    throw new AppError("CEP inválido", 400);
  }

  return apenasNumeros;
}

// Traduz o JSON do ViaCEP para o formato que a nossa API expõe.
function mapearEndereco(dados: ViaCepResponse): Endereco {
  return {
    cep: dados.cep,
    rua: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    estado: dados.uf,
  };
}

// Consulta o serviço externo (ViaCEP) e devolve o endereço já tratado.
// Cobre os 3 cenários possíveis: sucesso, CEP não encontrado e falha de rede/serviço.
export async function consultarCep(cepOriginal: string): Promise<Endereco> {
  const cep = validarCep(cepOriginal);

  let resposta: Response;

  try {
    resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  } catch (erroDeRede) {
    // fetch falhou (sem internet, DNS, timeout, etc.) -> serviço externo indisponível
    throw new AppError("Serviço externo indisponível", 502);
  }

  if (!resposta.ok) {
    // Resposta HTTP não é 2xx -> algo deu errado no serviço externo
    throw new AppError("Falha ao consultar serviço de CEP", 502);
  }

  const dados = (await resposta.json()) as ViaCepResponse;

  // ViaCEP responde 200 mesmo quando o CEP não existe, mas manda { erro: true }
  if (dados.erro) {
    throw new AppError("CEP não encontrado", 404);
  }

  return mapearEndereco(dados);
}
