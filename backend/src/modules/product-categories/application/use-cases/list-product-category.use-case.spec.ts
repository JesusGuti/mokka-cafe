import { InMemoryProductCategoryRepository } from '../../domain/ports/product-category.repository.fake';
import { CreateProductCategoryUseCase } from './create-product-category.use-case';
import { ListProductCategoryUseCase } from './list-product-category.use-case';

describe('ListProductCategoryUseCase', () => {
  let repository: InMemoryProductCategoryRepository;
  let create: CreateProductCategoryUseCase;
  let list: ListProductCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryProductCategoryRepository();
    create = new CreateProductCategoryUseCase(repository);
    list = new ListProductCategoryUseCase(repository);
  });

  it('devuelve una lista vacía si no hay categorías', async () => {
    await expect(list.execute()).resolves.toEqual([]);
  });

  it('lista las categorías en orden de creación con su cantidad de productos', async () => {
    const hot = await create.execute({ name: 'Calientes' });
    await create.execute({ name: 'Frías' });
    repository.setProductCount(hot.id, 4);

    const result = await list.execute();

    expect(
      result.map(({ category, productCount }) => [category.name, productCount]),
    ).toEqual([
      ['Calientes', 4],
      ['Frías', 0],
    ]);
  });
});
