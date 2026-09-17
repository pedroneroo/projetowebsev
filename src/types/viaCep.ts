// Contrato esperado da resposta da API externa (ViaCEP).
// O campo "erro" vem como true quando o CEP não é encontrado.
export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

// Formato que a nossa própria API devolve para o cliente.
// É a "tradução" do JSON externo para o nosso contrato.
export type Endereco = {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};
