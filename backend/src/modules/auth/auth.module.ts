import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { TokenGenerator } from './domain/ports/token-generator';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { JwtTokenGenerator } from './infrastructure/security/jwt-token-generator';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.expiresInSeconds'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    {
      provide: TokenGenerator,
      useClass: JwtTokenGenerator,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
