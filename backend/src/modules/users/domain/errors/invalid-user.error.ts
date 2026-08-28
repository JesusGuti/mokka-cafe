export class InvalidUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserError';
  }
}
