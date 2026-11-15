import { DuplicatedProductCategoryNameError } from '../../domain/errors/duplicated-product-category-name.error';
import { InvalidProductCategoryError } from '../../domain/errors/invalid-product-category.error';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { InMemoryProductCategoryRepository } from '../../domain/ports/product-category.repository.fake';
import { CreateProductCategoryUseCase } from './create-product-category.use-case';
import { EditProductCategoryUseCase } from './edit-product-category.use-case';

describe('EditProductCategoryUseCase', () => {
  let repository: InMemoryProductCategoryRepository;
  let create: CreateProductCategoryUseCase;
  let edit: EditProductCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryProductCategoryRepository();
    create = new CreateProductCategoryUseCase(repository);
    edit = new EditProductCategoryUseCase(repository);
  });

  it('cambia el nombre y lo persiste', async () => {
    const { id } = await create.execute({ name: 'Calientes' });

    const edited = await edit.execute({ id, name: '  Bebidas calientes ' });

    expect(edited.name).toBe('Bebidas calientes');
    await expect(repository.findById(id)).resolves.toMatchObject({
      name: 'Bebidas calientes',
    });
  });

  it('conserva el sortOrder al renombrar', async () => {
    await create.execute({ name: 'Calientes' });
    const { id } = await create.execute({ name: 'Frías' });

    await edit.execute({ id, name: 'Heladas' });

    await expect(repository.findById(id)).resolves.toMatchObject({
      sortOrder: 1,
    });
  });

  it('permite guardar el mismo nombre con otras mayúsculas', async () => {
    const { id } = await create.execute({ name: 'calientes' });

    await expect(
      edit.execute({ id, name: 'Calientes' }),
    ).resolves.toMatchObject({ name: 'Calientes' });
  });

  it('rechaza un nombre que ya usa otra categoría', async () => {
    await create.execute({ name: 'Calientes' });
    const { id } = await create.execute({ name: 'Frías' });

    await expect(edit.execute({ id, name: ' calientes' })).rejects.toThrow(
      DuplicatedProductCategoryNameError,
    );
  });

  it('falla si la categoría ya no existe', async () => {
    await expect(edit.execute({ id: 'nope', name: 'Frías' })).rejects.toThrow(
      ProductCategoryNotFoundError,
    );
  });

  it('rechaza un nombre inválido y no cambia nada', async () => {
    const { id } = await create.execute({ name: 'Calientes' });

    await expect(edit.execute({ id, name: '  ' })).rejects.toThrow(
      InvalidProductCategoryError,
    );
    await expect(repository.findById(id)).resolves.toMatchObject({
      name: 'Calientes',
    });
  });
});
