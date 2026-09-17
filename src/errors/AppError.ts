// Erro padronizado da aplicação.
// Sempre carrega uma mensagem amigável e um status HTTP correspondente.
export class AppError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}
