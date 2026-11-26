export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    /** Mensagem por campo, para o front marcar o campo certo do formulário. */
    public readonly campos?: Record<string, string>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Registro não encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, campos?: Record<string, string>) {
    super(message, 409, campos);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Faça login para continuar.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para esta ação.") {
    super(message, 403);
  }
}
