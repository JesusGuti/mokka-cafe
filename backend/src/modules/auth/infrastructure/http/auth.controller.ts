import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { Public } from '../decorators/public.decorator';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials';
import { SignInResponseDto } from './dto/auth-response-dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto): Promise<SignInResponseDto> {
    try {
      const result = await this.signInUseCase.execute(dto);
      return SignInResponseDto.fromResult(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
