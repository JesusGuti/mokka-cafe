import { Global, Module } from '@nestjs/common';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { Argon2PasswordHasher } from './argon2-password-hasher';

@Global()
@Module({
  providers: [
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },
  ],
  exports: [PasswordHasher],
})
export class SecurityModule {}
