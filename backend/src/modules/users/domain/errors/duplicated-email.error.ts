export class DuplicatedEmailError extends Error {
  constructor() {
    super('El email ya está en uso');
    this.name = 'DuplicatedEmailError';
  }
}
