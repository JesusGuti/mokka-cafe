import { UserRole } from '@generated/prisma/enums';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/ports/user.repository';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { DuplicatedEmailError } from '../../domain/errors/duplicated-email.error';
import { randomUUID } from 'node:crypto';

export interface CreateUserCommand {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(command.password);

    const user = User.create({
      id: randomUUID(),
      name: command.name,
      email: command.email,
      role: command.role,
      passwordHash,
    });

    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new DuplicatedEmailError();
    }

    await this.userRepository.save(user);

    return user;
  }
}
