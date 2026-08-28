export class InvalidEmailError extends Error {
  constructor(message = 'El email no tiene un formato válido') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}
