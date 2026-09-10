import { InvalidIngredientCategoryError } from '../../../ingredient-categories/domain/errors/invalid-ingredient-category.error';
import { InvalidIngredientError } from '../errors/invalid-ingredient.error';
import { InvalidMinStockThresholdError } from '../errors/invalid-min-stock-threshold.error';
import { InvalidUnitError } from '../errors/invalid-unit.error';
import { Ingredient } from './ingredient.entity';

describe('Ingredient entity', () => {
  it('crea un ingrediente valido, recorta el nombre, normaliza el nombre y la unidad y nace con 0 de stock actual', () => {
    const ingredient = Ingredient.create({
      id: '1',
      name: 'Azucar    ',
      unit: '   Kilo',
      categoryId: '1',
      minStockThreshold: 2,
    });

    expect(ingredient.name).toBe('Azucar');
    expect(ingredient.unit).toBe('Kilo');
    expect(ingredient.currentStockQty).toBe(0);
  });

  it('acepta un minStockThreshold nulll', () => {
    const ingredient = Ingredient.create({
      id: '1',
      name: 'Matcha    ',
      unit: '   Kilo',
      categoryId: '1',
      minStockThreshold: null,
    });

    expect(ingredient.name).toBe('Matcha');
    expect(ingredient.unit).toBe('Kilo');
    expect(ingredient.currentStockQty).toBe(0);
  });

  it('rechaza un nombre de ingrediente vacio', () => {
    expect(() =>
      Ingredient.create({
        id: '1',
        name: '   ',
        unit: '   Kilo',
        categoryId: '1',
        minStockThreshold: 2,
      }),
    ).toThrow(InvalidIngredientError);
  });

  it('rechaza un nombre de unidad vacio', () => {
    expect(() =>
      Ingredient.create({
        id: '1',
        name: 'Cafe',
        unit: '',
        categoryId: '1',
        minStockThreshold: 2,
      }),
    ).toThrow(InvalidUnitError);
  });

  it('rechaza un categoryId vacio', () => {
    expect(() =>
      Ingredient.create({
        id: '1',
        name: 'Leche',
        unit: 'Litro',
        categoryId: '',
        minStockThreshold: 10,
      }),
    ).toThrow(InvalidIngredientCategoryError);
  });

  it('si minStockThreshold es un número, rechaza un minStockThreshold menor a 0', () => {
    expect(() =>
      Ingredient.create({
        id: '1',
        name: 'Cafe',
        unit: 'Kilo',
        categoryId: '1',
        minStockThreshold: -1,
      }),
    ).toThrow(InvalidMinStockThresholdError);
  });
});
