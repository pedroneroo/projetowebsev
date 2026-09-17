import express from "express";
import * as enderecosController from "./controllers/enderecos.controller";
import * as clientesController from "./controllers/clientes.controller";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

// Rotas
app.get("/enderecos/:cep", enderecosController.buscarEndereco);

app.post("/clientes", clientesController.criarCliente);
app.get("/clientes", clientesController.listarClientes);

// O middleware de erro sempre vai por último, depois de todas as rotas.
app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
