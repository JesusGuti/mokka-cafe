import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { PasswordHashingError } from '@shared/domain/errors/password-hashing.error';
import argon2 from 'argon2';

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  async hash(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (error) {
      throw new PasswordHashingError(
        'No se pudo generar el hash de la contraseña',
        {
          cause: error,
        },
      );
    }
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new PasswordHashingError('No se pudo verificar la contraseña', {
        cause: error,
      });
    }
  }
}
