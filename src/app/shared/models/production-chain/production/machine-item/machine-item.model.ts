import { RecipeItem } from '../recipe-item/recipe-item.model';

export interface MachineItem extends RecipeItem {
  rate: number;
  totalRate: number;
}
