import { randomUUID } from 'node:crypto';
import { IngredientCategory } from '../../../ingredient-categories/domain/entities/ingredient-category.entity';
import { IngredientCategoryNotFoundError } from '../../../ingredient-categories/domain/errors/ingredient-category-not-found.error';
import { InMemoryIngredientCategoryRepository } from '../../../ingredient-categories/domain/ports/ingredient-category.repository.fake';
import { DuplicatedIngredientNameError } from '../../domain/errors/duplicated-ingredient.error';
import { InMemoryIngredientRepository } from '../../domain/ports/ingredient.repository.fake';
import { CreateIngredientUseCase } from './create-ingredient.use-case';

const buildUseCase = () => {
  const ingredientRepository = new InMemoryIngredientRepository();
  const ingredientCategoryRepository =
    new InMemoryIngredientCategoryRepository();
  const useCase = new CreateIngredientUseCase(
    ingredientRepository,
    ingredientCategoryRepository,
  );
  return { ingredientRepository, ingredientCategoryRepository, useCase };
};

const seedCategory = async (
  repository: InMemoryIngredientCategoryRepository,
  name = 'Lacteos',
) => {
  const category = IngredientCategory.create({ id: randomUUID(), name });
  await repository.save(category);
  return category;
};

describe('CreateIngredientUseCase', () => {
  it('crea y persiste un ingrediente sin depender de infraestructura real', async () => {
    const { ingredientRepository, ingredientCategoryRepository, useCase } =
      buildUseCase();
    const category = await seedCategory(ingredientCategoryRepository);

    const ingredient = await useCase.execute({
      name: 'Leche entera',
      unit: 'Litro',
      categoryId: category.id,
      minStockThreshold: 5,
    });

    expect(ingredient.name).toBe('Leche entera');
    expect(ingredient.unit).toBe('Litro');
    expect(ingredient.categoryId).toBe(category.id);
    expect(ingredient.currentStockQty).toBe(0);
    expect(ingredient.minStockThreshold).toBe(5);
    await expect(ingredientRepository.findByName('Leche entera')).resolves.toBe(
      ingredient,
    );
  });

  it('permite crear un ingrediente sin minStockThreshold', async () => {
    const { ingredientCategoryRepository, useCase } = buildUseCase();
    const category = await seedCategory(ingredientCategoryRepository);

    const ingredient = await useCase.execute({
      name: 'Matcha',
      unit: 'Kilo',
      categoryId: category.id,
      minStockThreshold: null,
    });

    expect(ingredient.minStockThreshold).toBeNull();
  });

  it('no permite crear un ingrediente si la categoría no existe', async () => {
    const { useCase } = buildUseCase();

    await expect(
      useCase.execute({
        name: 'Café en grano',
        unit: 'Kilo',
        categoryId: randomUUID(),
        minStockThreshold: null,
      }),
    ).rejects.toThrow(IngredientCategoryNotFoundError);
  });

  it('no permite crear dos ingredientes con el mismo nombre', async () => {
    const { ingredientCategoryRepository, useCase } = buildUseCase();
    const category = await seedCategory(ingredientCategoryRepository);

    await useCase.execute({
      name: 'Azúcar',
      unit: 'Kilo',
      categoryId: category.id,
      minStockThreshold: null,
    });

    await expect(
      useCase.execute({
        name: 'Azúcar',
        unit: 'Kilo',
        categoryId: category.id,
        minStockThreshold: null,
      }),
    ).rejects.toThrow('El nombre del ingrediente ya está en uso');
  });

  it('detecta nombres duplicados aunque vengan con espacios extra', async () => {
    const { ingredientCategoryRepository, useCase } = buildUseCase();
    const category = await seedCategory(ingredientCategoryRepository);

    await useCase.execute({
      name: '  Café  ',
      unit: 'Kilo',
      categoryId: category.id,
      minStockThreshold: null,
    });

    await expect(
      useCase.execute({
        name: 'Café',
        unit: 'Kilo',
        categoryId: category.id,
        minStockThreshold: null,
      }),
    ).rejects.toThrow(DuplicatedIngredientNameError);
  });

  it('propaga el error de dominio si los datos son inválidos', async () => {
    const { ingredientCategoryRepository, useCase } = buildUseCase();
    const category = await seedCategory(ingredientCategoryRepository);

    await expect(
      useCase.execute({
        name: '',
        unit: 'Kilo',
        categoryId: category.id,
        minStockThreshold: null,
      }),
    ).rejects.toThrow('El nombre es obligatorio');
  });
});
