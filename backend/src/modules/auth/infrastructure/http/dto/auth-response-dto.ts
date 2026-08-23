import { SignInResult } from '../../../application/use-cases/sign-in.use-case';

export class SignInResponseDto {
  accessToken!: string;

  static fromResult(result: SignInResult): SignInResponseDto {
    const dto = new SignInResponseDto();
    Object.assign(dto, result);
    return dto;
  }
}
