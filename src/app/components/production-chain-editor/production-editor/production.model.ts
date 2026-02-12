import { guid } from 'src/app/shared/utils/guid/guid.util';

export interface RecipeItem {
  name: string;
  count: number;
}

export interface MachineItem extends RecipeItem {
  rate: number;
  totalRate: number;
}

export interface ProductionRecipe {
  name: string;
  iconUrl?: string;
  useAutoName?: boolean;
  useAutoIcon?: boolean;
  timeToComplete: number;
  inputs: MachineItem[];
  outputs: MachineItem[];
}

export interface ProductionMachine {
  name: string;
  craftingSpeed: number;
  productivity: number;
}

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

interface ProductionNormalizationInput {
  id?: string;
  name?: string;
  iconUrl?: string;
  parentProductionId?: string;
  isExpanded?: boolean;
  count?: number;
  craftingSpeed?: number;
  productivity?: number;
  timeToComplete?: number;
  effectiveTime?: number;
  machineInputs?: MachineItem[];
  machineOutputs?: MachineItem[];
  recipe?: ProductionRecipe;
  machine?: ProductionMachine;
}

export function newMachineItem(): MachineItem {
  return {
    name: 'Default-Item',
    count: 1,
    /** effective rate */
    rate: 0,
    /** rate * machine count */
    totalRate: 0,
  };
}

export function newProduction(): Production {
  const production: Production = {
    id: guid(),
    name: 'Project Assembly',
    isExpanded: true,
    count: 1,
    effectiveTime: 1,
    recipe: {
      name: 'Default Recipe',
      iconUrl: undefined,
      useAutoName: true,
      useAutoIcon: true,
      timeToComplete: 1,
      inputs: [],
      outputs: [],
    },
    machine: {
      name: 'Default Machine',
      craftingSpeed: 1,
      productivity: 1,
    },
  };
  production.recipe.inputs.push(newMachineItem());
  production.recipe.outputs.push(newMachineItem());
  reCalcProductionRates(production);
  syncAutoProductionName(production);
  return production;
}

export const MOCK_Machine: Production = newProduction();

export function normalizeProduction(
  source: Production | ProductionNormalizationInput,
): Production {
  const legacy = source as ProductionNormalizationInput;
  const hasDirectRecipe = Boolean(legacy.recipe);
  const recipe: ProductionRecipe = legacy.recipe
    ? {
        name: legacy.recipe.name ?? 'Default Recipe',
        iconUrl:
          typeof legacy.recipe.iconUrl === 'string' &&
          legacy.recipe.iconUrl.trim().length > 0
            ? legacy.recipe.iconUrl.trim()
            : undefined,
        useAutoName:
          typeof legacy.recipe.useAutoName === 'boolean'
            ? legacy.recipe.useAutoName
            : undefined,
        useAutoIcon:
          typeof legacy.recipe.useAutoIcon === 'boolean'
            ? legacy.recipe.useAutoIcon
            : undefined,
        timeToComplete: legacy.recipe.timeToComplete ?? 1,
        inputs: Array.isArray(legacy.recipe.inputs)
          ? legacy.recipe.inputs.map((item) => ({ ...item }))
          : [],
        outputs: Array.isArray(legacy.recipe.outputs)
          ? legacy.recipe.outputs.map((item) => ({ ...item }))
          : [],
      }
    : {
        name: 'Default Recipe',
        timeToComplete: legacy.timeToComplete ?? 1,
        inputs: Array.isArray(legacy.machineInputs)
          ? legacy.machineInputs.map((item) => ({ ...item }))
          : [],
        outputs: Array.isArray(legacy.machineOutputs)
          ? legacy.machineOutputs.map((item) => ({ ...item }))
          : [],
      };

  const machine: ProductionMachine = legacy.machine
    ? {
        name: legacy.machine.name ?? 'Default Machine',
        craftingSpeed: legacy.machine.craftingSpeed ?? 1,
        productivity: legacy.machine.productivity ?? 1,
      }
    : {
        name: 'Default Machine',
        craftingSpeed: legacy.craftingSpeed ?? 1,
        productivity: legacy.productivity ?? 1,
      };

  const production: Production = {
    id: legacy.id ?? guid(),
    name: legacy.name ?? 'Project Assembly',
    iconUrl:
      typeof legacy.iconUrl === 'string' && legacy.iconUrl.trim().length > 0
        ? legacy.iconUrl.trim()
        : undefined,
    parentProductionId:
      typeof legacy.parentProductionId === 'string' &&
      legacy.parentProductionId.trim().length > 0
        ? legacy.parentProductionId.trim()
        : undefined,
    isExpanded:
      typeof legacy.isExpanded === 'boolean' ? legacy.isExpanded : true,
    count: legacy.count ?? 1,
    effectiveTime: legacy.effectiveTime ?? 1,
    recipe,
    machine,
  };

  ensureRecipeItems(production.recipe);
  const inferredRecipeName = getAutoRecipeName(production);
  const normalizedRecipeName = production.recipe.name.trim();
  if (production.recipe.useAutoName === undefined) {
    production.recipe.useAutoName =
      !normalizedRecipeName ||
      normalizedRecipeName.toLowerCase() === 'default recipe' ||
      normalizedRecipeName.toLowerCase() === inferredRecipeName.toLowerCase();
  }
  if (production.recipe.useAutoIcon === undefined) {
    production.recipe.useAutoIcon = hasDirectRecipe
      ? production.recipe.iconUrl === undefined
      : true;
  }

  reCalcProductionRates(production);
  syncAutoProductionName(production);
  return production;
}

export function toRecipeItems(items: MachineItem[]): RecipeItem[] {
  return items.map((item) => ({
    name: item.name,
    count: item.count,
  }));
}

export function toMachineItems(items: RecipeItem[]): MachineItem[] {
  return items.map((item) => ({
    name: item.name,
    count: item.count,
    rate: 0,
    totalRate: 0,
  }));
}

export function getAutoProductionName(production: Production): string {
  const recipeName = production.recipe.name?.trim() || 'Recipe';
  const machineName = production.machine.name?.trim() || 'Machine';
  return `${recipeName} in ${machineName}`;
}

export function syncAutoProductionName(production: Production): void {
  production.name = getAutoProductionName(production);
}

export function getAutoRecipeName(production: Production): string {
  const firstOutputName = production.recipe.outputs[0]?.name?.trim();
  return firstOutputName || 'Default Recipe';
}

export function syncAutoRecipeName(production: Production): void {
  if (production.recipe.useAutoName === false) {
    return;
  }
  production.recipe.useAutoName = true;
  production.recipe.name = getAutoRecipeName(production);
}

export function reCalcItemRate(
  item: MachineItem,
  production: Production,
): void {
  const effectiveTime = production.effectiveTime;
  const productivity =
    production.machine.productivity < 0 ? 0 : production.machine.productivity;
  item.rate =
    effectiveTime > 0 ? (item.count * productivity) / effectiveTime : 0;
  item.totalRate = item.rate * production.count;
}

export function reCalcItemRates(
  production: Production,
  itemList: MachineItem[],
): void {
  itemList.forEach((item) => {
    reCalcItemRate(item, production);
  });
}

export function reCalcProductionRates(production: Production): void {
  syncAutoRecipeName(production);
  const craftSpeed =
    production.machine.craftingSpeed > 0 ? production.machine.craftingSpeed : 0;
  production.effectiveTime =
    craftSpeed > 0 ? production.recipe.timeToComplete / craftSpeed : 0;
  reCalcItemRates(production, production.recipe.inputs);
  reCalcItemRates(production, production.recipe.outputs);
  syncAutoProductionName(production);
}

function ensureRecipeItems(recipe: ProductionRecipe): void {
  if (!Array.isArray(recipe.inputs)) {
    recipe.inputs = [];
  }
  if (!Array.isArray(recipe.outputs)) {
    recipe.outputs = [];
  }
  if (recipe.inputs.length === 0) {
    recipe.inputs.push(newMachineItem());
  }
  if (recipe.outputs.length === 0) {
    recipe.outputs.push(newMachineItem());
  }
  if (
    typeof recipe.iconUrl === 'string' &&
    recipe.iconUrl.trim().length === 0
  ) {
    recipe.iconUrl = undefined;
  }
}
