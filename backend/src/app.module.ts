import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import corsConfig from './config/cors.config';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { SecurityModule } from './shared/infrastructure/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
      load: [corsConfig, databaseConfig],
    }),
    PrismaModule,
    SecurityModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
