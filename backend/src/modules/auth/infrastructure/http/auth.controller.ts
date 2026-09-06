import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { RefreshUseCase } from '../../application/use-cases/refresh.use-case';
import { Public } from '../decorators/public.decorator';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token';
import { RefreshResponseDto, SignInResponseDto } from './dto/auth-response-dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

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

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto): Promise<RefreshResponseDto> {
    try {
      const result = await this.refreshUseCase.execute(dto);
      return RefreshResponseDto.fromResult(result);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
