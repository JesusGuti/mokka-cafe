import { InvalidEmailError } from '../errors/invalid-email.error';

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw?.trim().toLowerCase();
    const [local, domain, ...rest] = normalized?.split('@') ?? [];
    const isValid =
      !!local &&
      !!domain &&
      rest.length === 0 &&
      !normalized.includes(' ') &&
      domain.includes('.') &&
      !domain.startsWith('.') &&
      !domain.endsWith('.');

    if (!isValid) {
      throw new InvalidEmailError();
    }
    return new Email(normalized);
  }
}
