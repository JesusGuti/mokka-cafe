import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UserRepository } from './domain/ports/user.repository';
import { UserController } from './infrastructure/http/user.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
  ],
  exports: [UserRepository],
})
export class UsersModule {}
