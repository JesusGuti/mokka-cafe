import { InvalidProductError } from '../errors/invalid-product.error';
import { Product } from './product.entity';

describe('Product entity', () => {
  it('crea un producto válido y recorta espacios del nombre', () => {
    const product = Product.create({
      id: '1',
      name: '  Latte  ',
      priceCents: 3500,
      categoryId: 'cat-bebidas',
    });

    expect(product.name).toBe('Latte');
    expect(product.isAvailable).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    expect(() =>
      Product.create({
        id: '1',
        name: '   ',
        priceCents: 100,
        categoryId: 'cat-bebidas',
      }),
    ).toThrow(InvalidProductError);
  });

  it('rechaza precio negativo o no entero', () => {
    expect(() =>
      Product.create({
        id: '1',
        name: 'Latte',
        priceCents: -1,
        categoryId: 'cat-bebidas',
      }),
    ).toThrow(InvalidProductError);
  });
});
