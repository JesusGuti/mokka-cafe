import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/ports/product.repository';
import { CreateProductUseCase } from './create-product.use-case';

class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  save(product: Product): Promise<void> {
    this.products.set(product.id, product);
    return Promise.resolve();
  }
  findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.products.get(id) ?? null);
  }
  findAll(): Promise<Product[]> {
    return Promise.resolve([...this.products.values()]);
  }
  delete(id: string): Promise<void> {
    this.products.delete(id);
    return Promise.resolve();
  }
}

describe('CreateProductUseCase', () => {
  it('crea y persiste un producto sin depender de infraestructura real', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new CreateProductUseCase(repository);

    const product = await useCase.execute({
      name: 'Espresso',
      priceCents: 2500,
      categoryId: 'cat-bebidas',
    });

    expect(product.name).toBe('Espresso');
    await expect(repository.findById(product.id)).resolves.toBe(product);
  });

  it('propaga el error de dominio si los datos son inválidos', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new CreateProductUseCase(repository);

    await expect(
      useCase.execute({ name: '', priceCents: 100, category: 'bebidas' }),
    ).rejects.toThrow('El nombre del producto es obligatorio');
  });
});
