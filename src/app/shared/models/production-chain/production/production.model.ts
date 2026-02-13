import { ProductionMachine } from './production-machine/production-machine.model';
import { ProductionRecipe } from './production-recipe/production-recipe.model';

export interface Production {
  id: string;
  name: string;
  iconUrl?: string;
  parentProductionId?: string;
  isExpanded: boolean;
  count: number;
  effectiveTime: number;
  recipe: ProductionRecipe;
  machine: ProductionMachine;
}
