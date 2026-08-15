import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/ports/product.repository';
import { ProductMapper } from './product.mapper';

/**
 * Adaptador de salida: implementa el puerto ProductRepository usando Prisma.
 * Es el único lugar del módulo que sabe que la persistencia es Postgres/Prisma.
 */
@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<void> {
    const data = ProductMapper.toPersistence(product);
    await this.prisma.product.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { id } });
    return raw ? ProductMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
