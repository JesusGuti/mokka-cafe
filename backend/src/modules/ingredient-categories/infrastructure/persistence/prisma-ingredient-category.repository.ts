import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';
import { IngredientCategoryMapper } from './ingredient-category.mapper';

@Injectable()
export class PrismaIngredientCategoryRepository implements IngredientCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(ingredientCategory: IngredientCategory): Promise<void> {
    const data = IngredientCategoryMapper.toPersistence(ingredientCategory);

    await this.prisma.ingredientCategory.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findAll(): Promise<IngredientCategory[]> {
    const rows = await this.prisma.ingredientCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => IngredientCategoryMapper.toDomain(row));
  }

  async findById(id: string): Promise<IngredientCategory | null> {
    const raw = await this.prisma.ingredientCategory.findUnique({
      where: { id },
    });

    return raw ? IngredientCategoryMapper.toDomain(raw) : null;
  }

  async findByName(name: string): Promise<IngredientCategory | null> {
    const raw = await this.prisma.ingredientCategory.findUnique({
      where: { name },
    });

    return raw ? IngredientCategoryMapper.toDomain(raw) : null;
  }
}
