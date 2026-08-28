import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokenPayload,
  TokenGenerator,
} from '../../domain/ports/token-generator';

@Injectable()
export class JwtTokenGenerator extends TokenGenerator {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  sign(payload: AuthTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): AuthTokenPayload {
    return this.jwtService.verify<AuthTokenPayload>(token);
  }
}
