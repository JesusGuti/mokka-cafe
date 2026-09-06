import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokenPayload,
  TokenGenerator,
} from '../../domain/ports/token-generator';

export const REFRESH_JWT_SERVICE = Symbol('REFRESH_JWT_SERVICE');

@Injectable()
export class JwtTokenGenerator extends TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REFRESH_JWT_SERVICE) private readonly refreshJwtService: JwtService,
  ) {
    super();
  }

  sign(payload: AuthTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): AuthTokenPayload {
    return this.jwtService.verify<AuthTokenPayload>(token);
  }

  signRefreshToken(payload: AuthTokenPayload): string {
    return this.refreshJwtService.sign(payload);
  }
  verifyRefreshToken(token: string): AuthTokenPayload {
    return this.refreshJwtService.verify<AuthTokenPayload>(token);
  }
}
