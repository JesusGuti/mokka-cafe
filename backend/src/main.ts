import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Orígenes permitidos configurables por env (CORS_ORIGIN) — ver src/config/cors.config.ts
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Permite que PrismaService.onModuleDestroy corra en un shutdown (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  // Swagger configurable por env (SWAGGER_ENABLED, SWAGGER_PATH) — ver src/config/swagger.config.ts.
  // Apagado por defecto en producción.
  if (configService.get<boolean>('swagger.enabled', false)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title', ''))
      .setDescription(configService.get<string>('swagger.description', ''))
      .setVersion(configService.get<string>('swagger.version', ''))
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      configService.get<string>('swagger.path', 'api'),
      app,
      documentFactory,
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
