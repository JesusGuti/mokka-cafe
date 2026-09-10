import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IngredientRepository } from '../../domain/ports/ingredient.repository';
import { Ingredient } from '../../domain/entities/ingredient.entity';
import { IngredientMapper } from './ingredient.mapper';

@Injectable()
export class PrismaIngredientRepository implements IngredientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(ingredient: Ingredient): Promise<void> {
    const data = IngredientMapper.toPersistence(ingredient);

    await this.prisma.ingredient.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findAll(): Promise<Ingredient[]> {
    const rows = await this.prisma.ingredient.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => IngredientMapper.toDomain(row));
  }

  async findById(id: string): Promise<Ingredient | null> {
    const raw = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    return raw ? IngredientMapper.toDomain(raw) : null;
  }

  async findByName(name: string): Promise<Ingredient | null> {
    const raw = await this.prisma.ingredient.findUnique({
      where: { name },
    });

    return raw ? IngredientMapper.toDomain(raw) : null;
  }
}
