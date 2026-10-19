import { CreateIngredientCategoryUseCase } from './create-ingredient-category.use-case';
import { InMemoryIngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository.fake';

describe('CreateIngredientCategoryUseCase', () => {
  it('crea y persiste una categoría de ingrediente sin depender de infraestructura real', async () => {
    const repository = new InMemoryIngredientCategoryRepository();
    const useCase = new CreateIngredientCategoryUseCase(repository);

    const ingredientCategory = await useCase.execute({
      name: 'Lacteos',
    });

    expect(ingredientCategory.name).toBe('Lacteos');
    await expect(repository.findById(ingredientCategory.id)).resolves.toBe(
      ingredientCategory,
    );
  });

  it('no permite crear dos categorias de ingrediente con el mismo nombre', async () => {
    const repository = new InMemoryIngredientCategoryRepository();
    const useCase = new CreateIngredientCategoryUseCase(repository);

    await useCase.execute({
      name: 'Infusiones',
    });

    await expect(
      useCase.execute({
        name: 'Infusiones',
      }),
    ).rejects.toThrow('El nombre de la categoría ya está en uso');
  });

  it('propaga el error de dominio si los datos son inválidos', async () => {
    const repository = new InMemoryIngredientCategoryRepository();
    const useCase = new CreateIngredientCategoryUseCase(repository);

    await expect(
      useCase.execute({
        name: '',
      }),
    ).rejects.toThrow('El nombre de la categoría es obligatorio');
  });
});
