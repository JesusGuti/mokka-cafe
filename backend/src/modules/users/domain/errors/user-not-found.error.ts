export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Usuario con id "${id}" no encontrado`);
    this.name = 'UserNotFoundError';
  }
}
