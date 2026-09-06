export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('El refresh token es inválido, expiró, o el usuario ya no existe');
    this.name = 'InvalidRefreshTokenError';
  }
}
