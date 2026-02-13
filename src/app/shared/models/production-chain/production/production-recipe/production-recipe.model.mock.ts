import { ProductionRecipe } from './production-recipe.model';

export const MOCK_ProductionRecipe: ProductionRecipe = {
  name: 'Green Circuits',
  timeToComplete: 0.5,
  inputs: [
    { name: 'Iron Plate', count: 1, rate: 1.5, totalRate: 3 },
    { name: 'Copper Cable', count: 3, rate: 4.5, totalRate: 9 },
  ],
  outputs: [{ name: 'Electronic circuit', count: 1, rate: 1.5, totalRate: 3 }],
};

export const MOCK_ProductionRecipe_Array: ProductionRecipe[] = [
  MOCK_ProductionRecipe,
];
