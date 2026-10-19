import { InvalidIngredientCategoryError } from '../errors/invalid-ingredient-category.error';
import { IngredientCategory } from './ingredient-category.entity';

describe('IngredientCategory entity', () => {
  it('crea una categoría válida y recorta espacios del nombre', () => {
    const category = IngredientCategory.create({
      id: '1',
      name: '  Lácteos  ',
    });

    expect(category.name).toBe('Lácteos');
  });

  it('rechaza nombre vacío', () => {
    expect(() => IngredientCategory.create({ id: '1', name: '   ' })).toThrow(
      InvalidIngredientCategoryError,
    );
  });
});
