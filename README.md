# API de Clientes com Consulta de CEP

Mini projeto da Aula 06 (Consumo de APIs e Integração de Serviços). A API cadastra
clientes e usa o serviço externo **ViaCEP** para completar o endereço automaticamente.

## Estrutura de pastas

```
src/
├── server.ts
├── controllers/
│   ├── enderecos.controller.ts
│   └── clientes.controller.ts
├── services/
│   ├── enderecos.service.ts      # consome a API externa (ViaCEP)
│   └── clientes.service.ts       # regra de negócio + "banco" em memória
├── middlewares/
│   └── errorHandler.ts           # trata erros de forma centralizada
├── errors/
│   └── AppError.ts
└── types/
    └── viaCep.ts
```

## Como instalar

Pré-requisito: Node.js 18 ou superior instalado (o `fetch` já vem nativo).

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

## Endpoints

### GET /enderecos/:cep
Consulta um CEP no ViaCEP e devolve o endereço já tratado.

- `GET /enderecos/79002000` → `200` com `{ cep, rua, bairro, cidade, estado }`
- `GET /enderecos/123` → `400` `{ mensagem: "CEP inválido" }`
- `GET /enderecos/00000000` → `404` `{ mensagem: "CEP não encontrado" }`
- Se o ViaCEP estiver fora do ar → `502` `{ mensagem: "Serviço externo indisponível" }`

### POST /clientes
Cadastra um cliente usando o CEP para montar o endereço.

Body:
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "cep": "79002000"
}
```

- Sucesso → `201` com o cliente criado, incluindo `endereco`
- Nome ou email vazio → `400`
- CEP inválido/inexistente → `400`/`404` (a mesma regra do endpoint acima)

### GET /clientes
Lista todos os clientes cadastrados (em memória, some ao reiniciar o servidor).

- `200` com um array de clientes

## Como testar (Thunder Client / Insomnia / Postman)

| Teste                | Requisição                     | Esperado           |
|-----------------------|---------------------------------|---------------------|
| CEP válido            | GET /enderecos/79002000        | 200 + endereço      |
| CEP curto/inválido    | GET /enderecos/123             | 400                 |
| CEP inexistente       | GET /enderecos/00000000        | 404                 |
| Serviço externo falha | desligar a internet e repetir  | 502                 |
| Criar cliente         | POST /clientes (body válido)   | 201                 |
| Nome vazio            | POST /clientes sem "nome"      | 400                 |
| Listar clientes       | GET /clientes                  | 200 + array         |

## Testes

Resultado obtido ao executar:

```
PASSOU - GET /enderecos/79002000 (CEP válido) -> 200 -> {"cep":"79002-000","rua":"Rua Example","bairro":"Centro","cidade":"Campo Grande","estado":"MS"}
PASSOU - GET /enderecos/123 (CEP inválido) -> status 400 - "CEP inválido"
PASSOU - GET /enderecos/00000000 (CEP inexistente) -> status 404 - "CEP não encontrado"
PASSOU - GET /enderecos/79002000 (serviço externo fora) -> status 502 - "Serviço externo indisponível"
PASSOU - POST /clientes (dados válidos) -> 201 -> {"id":1,"nome":"Maria Silva","email":"maria@email.com","endereco":{"cep":"79002-000","rua":"Rua Example","bairro":"Centro","cidade":"Campo Grande","estado":"MS"}}
PASSOU - POST /clientes (nome vazio) -> status 400 - "Nome obrigatório"
PASSOU - GET /clientes (listagem) -> 200 -> array com 1 cliente(s)

Resumo:
7/7 testes passaram.
```

## Observações de design

- O **controller** só cuida de HTTP (ler request, chamar service, devolver JSON).
- A **service** concentra a regra: valida o CEP, monta a URL, chama o ViaCEP,
  interpreta a resposta e traduz para o formato da nossa API.
- Erros são lançados como `AppError(mensagem, status)` e tratados em um único
  lugar (`errorHandler`), então o cliente da API nunca recebe um erro técnico
  "cru" do serviço externo.
