import { InMemoryProductCategoryRepository } from '../../domain/ports/product-category.repository.fake';
import { DuplicatedProductCategoryNameError } from '../../domain/errors/duplicated-product-category-name.error';
import { InvalidProductCategoryError } from '../../domain/errors/invalid-product-category.error';
import { CreateProductCategoryUseCase } from './create-product-category.use-case';

describe('CreateProductCategoryUseCase', () => {
  let repository: InMemoryProductCategoryRepository;
  let useCase: CreateProductCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryProductCategoryRepository();
    useCase = new CreateProductCategoryUseCase(repository);
  });

  it('crea y persiste una categoría', async () => {
    const category = await useCase.execute({ name: 'Calientes' });

    expect(category.name).toBe('Calientes');
    await expect(repository.findById(category.id)).resolves.not.toBeNull();
  });

  it('la primera categoría queda con sortOrder 0', async () => {
    const category = await useCase.execute({ name: 'Calientes' });

    expect(category.sortOrder).toBe(0);
  });

  it('una categoría nueva entra al final', async () => {
    await useCase.execute({ name: 'Calientes' });
    await useCase.execute({ name: 'Frías' });
    const third = await useCase.execute({ name: 'Postres' });

    expect(third.sortOrder).toBe(2);
  });

  it('no repite sortOrder después de eliminar una categoría del medio', async () => {
    await useCase.execute({ name: 'Calientes' });
    const middle = await useCase.execute({ name: 'Frías' });
    await useCase.execute({ name: 'Postres' });
    await repository.delete(middle.id);

    const next = await useCase.execute({ name: 'Snacks' });

    expect(next.sortOrder).toBe(3);
  });

  it('rechaza un nombre duplicado ignorando mayúsculas y espacios', async () => {
    await useCase.execute({ name: 'Calientes' });

    await expect(useCase.execute({ name: ' calientes ' })).rejects.toThrow(
      DuplicatedProductCategoryNameError,
    );
  });

  it('propaga el error de dominio si el nombre es inválido', async () => {
    await expect(useCase.execute({ name: '   ' })).rejects.toThrow(
      InvalidProductCategoryError,
    );
  });
});
