import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials';
import { TokenGenerator } from '../../domain/ports/token-generator';
import { UserRepository } from '../../../users/domain/ports/user.repository';

export interface SignInCommand {
  email: string;
  password: string;
}

export interface SignInResult {
  accessToken: string;
}

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Update last login timestamp for audit
    user.updateLastLogin();
    await this.userRepository.update(user);

    // Generate JWT token
    const accessToken = this.tokenGenerator.sign({
      sub: user.id,
      role: user.role,
    });

    return { accessToken };
  }
}
