export class InvalidCredentialsError extends Error {
  constructor() {
    super('El correo electrónico o la contraseña no son correctos');
    this.name = 'InvalidCredentialsError';
  }
}
