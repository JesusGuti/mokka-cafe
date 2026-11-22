import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';
import { IngredientCategoryMapper } from './ingredient-category.mapper';
import {
  hasPrismaCode,
  PRISMA_UNIQUE_VIOLATION,
} from '@shared/infrastructure/prisma/prisma-error';
import { DuplicatedIngredientCategoryNameError } from '../../domain/errors/duplicated-ingredient-category-name.error';

@Injectable()
export class PrismaIngredientCategoryRepository implements IngredientCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ingredientCategory: IngredientCategory): Promise<void> {
    const data = IngredientCategoryMapper.toPersistence(ingredientCategory);

    try {
      await this.prisma.ingredientCategory.create({
        data,
      });
    } catch (error) {
      if (hasPrismaCode(error, PRISMA_UNIQUE_VIOLATION)) {
        throw new DuplicatedIngredientCategoryNameError();
      }
      throw error;
    }
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
    const raw = await this.prisma.ingredientCategory.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    return raw ? IngredientCategoryMapper.toDomain(raw) : null;
  }
}
