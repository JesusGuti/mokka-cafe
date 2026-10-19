export class InvalidMinStockThresholdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMinStockThresholdError';
  }
}
