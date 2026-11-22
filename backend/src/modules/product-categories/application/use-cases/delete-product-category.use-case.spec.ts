import { ProductCategoryHasProductsError } from '../../domain/errors/product-category-has-products.error';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { InMemoryProductCategoryRepository } from '../../domain/ports/product-category.repository.fake';
import { CreateProductCategoryUseCase } from './create-product-category.use-case';
import { DeleteProductCategoryUseCase } from './delete-product-category.use-case';

describe('DeleteProductCategoryUseCase', () => {
  let repository: InMemoryProductCategoryRepository;
  let create: CreateProductCategoryUseCase;
  let remove: DeleteProductCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryProductCategoryRepository();
    create = new CreateProductCategoryUseCase(repository);
    remove = new DeleteProductCategoryUseCase(repository);
  });

  it('elimina una categoría sin productos', async () => {
    const { id } = await create.execute({ name: 'Calientes' });

    await remove.execute(id);

    await expect(repository.findById(id)).resolves.toBeNull();
  });

  it('bloquea el borrado si tiene productos y avisa cuántos', async () => {
    const { id } = await create.execute({ name: 'Calientes' });
    repository.setProductCount(id, 4);

    const attempt = remove.execute(id);

    await expect(attempt).rejects.toThrow(ProductCategoryHasProductsError);
    await expect(attempt).rejects.toThrow(
      'Tiene 4 productos. Muévelos o archívalos primero',
    );
  });

  it('no borra nada cuando está bloqueado', async () => {
    const { id } = await create.execute({ name: 'Calientes' });
    repository.setProductCount(id, 1);

    await expect(remove.execute(id)).rejects.toThrow();

    await expect(repository.findById(id)).resolves.not.toBeNull();
  });

  it('falla si la categoría ya no existe', async () => {
    await expect(remove.execute('nope')).rejects.toThrow(
      ProductCategoryNotFoundError,
    );
  });

  it('solo elimina la categoría indicada', async () => {
    const hot = await create.execute({ name: 'Calientes' });
    const cold = await create.execute({ name: 'Frías' });

    await remove.execute(hot.id);

    await expect(repository.findById(cold.id)).resolves.not.toBeNull();
  });
});
