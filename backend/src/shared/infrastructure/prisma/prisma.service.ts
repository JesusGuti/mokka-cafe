import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

/**
 * Singleton de Prisma para toda la app.
 *
 * - Se instancia una sola vez gracias al scope por defecto de Nest (DI singleton)
 *   y a que PrismaModule es @Global(), así que nunca hay más de un pool de
 *   conexiones activo por proceso.
 * - El pool de conexiones lo maneja el driver adapter (PrismaPg -> pg.Pool),
 *   configurable vía variables de entorno (DATABASE_POOL_*).
 * - $connect/$disconnect están atados al ciclo de vida del módulo de Nest.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
      max: config.get<number>('database.pool.max'),
      idleTimeoutMillis: config.get<number>('database.pool.idleTimeoutMillis'),
      connectionTimeoutMillis: config.get<number>(
        'database.pool.connectionTimeoutMillis',
      ),
    });

    super({
      adapter,
      log:
        config.get('NODE_ENV') === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado a la base de datos');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Conexión a la base de datos cerrada');
  }
}
