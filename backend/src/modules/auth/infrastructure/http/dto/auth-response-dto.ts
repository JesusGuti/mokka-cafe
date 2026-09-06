import { SignInResult } from '../../../application/use-cases/sign-in.use-case';
import { RefreshResult } from '../../../application/use-cases/refresh.use-case';

export class SignInResponseDto {
  accessToken!: string;
  refreshToken!: string;

  static fromResult(result: SignInResult): SignInResponseDto {
    const dto = new SignInResponseDto();
    Object.assign(dto, result);
    return dto;
  }
}

export class RefreshResponseDto {
  accessToken!: string;

  static fromResult(result: RefreshResult): RefreshResponseDto {
    const dto = new RefreshResponseDto();
    Object.assign(dto, result);
    return dto;
  }
}
