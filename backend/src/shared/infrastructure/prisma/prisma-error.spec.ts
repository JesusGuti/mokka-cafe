import { Prisma } from '@generated/prisma/client';
import {
  hasPrismaCode,
  PRISMA_FOREIGN_KEY_VIOLATION,
  PRISMA_RECORD_NOT_FOUND,
  PRISMA_UNIQUE_VIOLATION,
} from './prisma-error';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
  });

describe('hasPrismaCode', () => {
  it('es true cuando es un error conocido de Prisma con ese código', () => {
    expect(
      hasPrismaCode(
        prismaError(PRISMA_UNIQUE_VIOLATION),
        PRISMA_UNIQUE_VIOLATION,
      ),
    ).toBe(true);
  });

  it('es false cuando el código es distinto', () => {
    expect(
      hasPrismaCode(
        prismaError(PRISMA_RECORD_NOT_FOUND),
        PRISMA_FOREIGN_KEY_VIOLATION,
      ),
    ).toBe(false);
  });

  it.each([
    ['un Error común', new Error('P2002')],
    ['un objeto con code', { code: PRISMA_UNIQUE_VIOLATION }],
    ['null', null],
    ['undefined', undefined],
  ])('es false para %s', (_label, error) => {
    expect(hasPrismaCode(error, PRISMA_UNIQUE_VIOLATION)).toBe(false);
  });
});
