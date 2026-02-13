import { Production } from '../production-chain/production/production.model';
import { RecipeItem } from '../production-chain/production/recipe-item/recipe-item.model';

export interface CatalogItem {
  name: string;
  iconUrl?: string;
  isMachine?: boolean;
  craftingSpeed?: number;
  productivity?: number;
}

export interface CatalogRecipe {
  name: string;
  iconUrl?: string;
  timeToComplete: number;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
}

export interface CatalogMachine {
  name: string;
  iconUrl?: string;
  craftingSpeed: number;
  productivity: number;
}

export interface CatalogProduction {
  name: string;
  iconUrl?: string;
  production: Production;
}

export interface ProductionCatalogState {
  items: CatalogItem[];
  recipes: CatalogRecipe[];
  productions: CatalogProduction[];
}

export function createDefaultCatalogState(): ProductionCatalogState {
  return {
    items: [],
    recipes: [],
    productions: [],
  };
}
