import { InvalidProductCategoryError } from '../errors/invalid-product-category.error';
import {
  PRODUCT_CATEGORY_NAME_MAX_LENGTH,
  ProductCategory,
} from './product-category.entity';

describe('ProductCategory entity', () => {
  const build = (name = 'Calientes', sortOrder = 0) =>
    ProductCategory.create({ id: '1', name, sortOrder });

  describe('create', () => {
    it('crea una categoría válida y recorta espacios del nombre', () => {
      const category = build('  Calientes  ', 3);

      expect(category.name).toBe('Calientes');
      expect(category.sortOrder).toBe(3);
    });

    it('rechaza nombre vacío o solo espacios', () => {
      expect(() => build('')).toThrow(InvalidProductCategoryError);
      expect(() => build('   ')).toThrow(InvalidProductCategoryError);
    });

    it('acepta un nombre de exactamente el largo máximo', () => {
      const name = 'a'.repeat(PRODUCT_CATEGORY_NAME_MAX_LENGTH);

      expect(build(name).name).toBe(name);
    });

    it('rechaza un nombre más largo que el máximo', () => {
      const name = 'a'.repeat(PRODUCT_CATEGORY_NAME_MAX_LENGTH + 1);

      expect(() => build(name)).toThrow(InvalidProductCategoryError);
    });

    it('guarda emojis y caracteres especiales sin alterarlos', () => {
      expect(build('Té & Café ☕').name).toBe('Té & Café ☕');
    });

    it.each([-1, 1.5, Number.NaN])(
      'rechaza un sortOrder inválido (%p)',
      (sortOrder) => {
        expect(() => build('Calientes', sortOrder)).toThrow(
          InvalidProductCategoryError,
        );
      },
    );
  });

  describe('rename', () => {
    it('cambia el nombre recortado y actualiza updatedAt', () => {
      const category = ProductCategory.reconstitute({
        id: '1',
        name: 'Calientes',
        sortOrder: 0,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      category.rename('  Frías ');

      expect(category.name).toBe('Frías');
      expect(category.updatedAt.getTime()).toBeGreaterThan(
        category.createdAt.getTime(),
      );
    });

    it('rechaza un nombre inválido y conserva el anterior', () => {
      const category = build('Calientes');

      expect(() => category.rename('  ')).toThrow(InvalidProductCategoryError);
      expect(category.name).toBe('Calientes');
    });
  });
});
