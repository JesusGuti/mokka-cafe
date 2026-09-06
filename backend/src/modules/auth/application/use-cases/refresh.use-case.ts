import { Injectable } from '@nestjs/common';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token';
import { TokenGenerator } from '../../domain/ports/token-generator';
import { UserRepository } from '../../../users/domain/ports/user.repository';

export interface RefreshCommand {
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
}

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: RefreshCommand): Promise<RefreshResult> {
    const payload = this.verifyRefreshToken(command.refreshToken);
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    if (!user.isActive) {
      throw new InvalidRefreshTokenError();
    }

    const accessToken = this.tokenGenerator.sign({
      sub: user.id,
      role: user.role,
    });

    return { accessToken };
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      return this.tokenGenerator.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }
  }
}
