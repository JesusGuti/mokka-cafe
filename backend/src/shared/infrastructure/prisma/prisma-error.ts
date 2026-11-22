import { Prisma } from '@generated/prisma/client';

export const PRISMA_UNIQUE_VIOLATION = 'P2002';
export const PRISMA_RECORD_NOT_FOUND = 'P2025';
export const PRISMA_FOREIGN_KEY_VIOLATION = 'P2003';

export const hasPrismaCode = (error: unknown, code: string): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
