import { MachineItem } from 'src/app/shared/models/production-chain/production/machine-item/machine-item.model';
import { ProductionMachine } from 'src/app/shared/models/production-chain/production/production-machine/production-machine.model';
import { ProductionRecipe } from 'src/app/shared/models/production-chain/production/production-recipe/production-recipe.model';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';
import { RecipeItem } from 'src/app/shared/models/production-chain/production/recipe-item/recipe-item.model';
import { guid } from 'src/app/shared/utils/guid/guid.util';

interface ProductionNormalizationInput {
  id?: string;
  name?: string;
  iconUrl?: string;
  parentProductionId?: string;
  isExpanded?: boolean;
  count?: number;
  craftingSpeed?: number;
  productivity?: number;
  drain?: number;
  timeToComplete?: number;
  effectiveTime?: number;
  machineInputs?: MachineItem[];
  machineOutputs?: MachineItem[];
  recipe?: ProductionRecipe;
  machine?: ProductionMachine;
}

export function newMachineItem(): MachineItem {
  return {
    name: '',
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
    name: '',
    isExpanded: true,
    count: 1,
    effectiveTime: 1,
    recipe: {
      name: '',
      iconUrl: undefined,
      useAutoName: true,
      useAutoIcon: true,
      timeToComplete: 1,
      inputs: [],
      outputs: [],
    },
    machine: {
      name: '',
      craftingSpeed: 1,
      productivity: 1,
      drain: 1,
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
        name: legacy.recipe.name ?? '',
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
        name: '',
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
        name: legacy.machine.name ?? '',
        craftingSpeed: legacy.machine.craftingSpeed ?? 1,
        productivity: legacy.machine.productivity ?? 1,
        drain: legacy.machine.drain ?? 1,
      }
    : {
        name: '',
        craftingSpeed: legacy.craftingSpeed ?? 1,
        productivity: legacy.productivity ?? 1,
        drain: legacy.drain ?? 1,
      };

  const production: Production = {
    id: legacy.id ?? guid(),
    name: legacy.name ?? '',
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
  const recipeName = production.recipe.name?.trim() || '';
  const machineName = production.machine.name?.trim() || '';
  if (!recipeName && !machineName) {
    return '';
  }
  if (!recipeName || !machineName) {
    return recipeName || machineName;
  }
  return `${recipeName} in ${machineName}`;
}

export function syncAutoProductionName(production: Production): void {
  production.name = getAutoProductionName(production);
}

export function getAutoRecipeName(production: Production): string {
  const firstOutputName = production.recipe.outputs[0]?.name?.trim();
  return firstOutputName || '';
}

export function syncAutoRecipeName(production: Production): void {
  if (production.recipe.useAutoName === false) {
    return;
  }
  production.recipe.useAutoName = true;
  production.recipe.name = getAutoRecipeName(production);
}

/**
 * Recalculates per-machine and total item rates using the current production multipliers.
 * Formula:
 * - effectiveTime = recipe.timeToComplete / machine.craftingSpeed
 * - input rate = item.count * machine.drain / effectiveTime
 * - output rate = item.count * machine.productivity / effectiveTime
 */
export function reCalcItemRate(
  item: MachineItem,
  production: Production,
): void {
  const effectiveTime = production.effectiveTime;
  const productivity = toNonNegativeMultiplier(production.machine.productivity);
  const drain = toNonNegativeMultiplier(production.machine.drain);
  const isInput = production.recipe.inputs.includes(item);
  const multiplier = isInput ? drain : productivity;
  item.rate = effectiveTime > 0 ? (item.count * multiplier) / effectiveTime : 0;
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

function toNonNegativeMultiplier(value: number): number {
  return value < 0 ? 0 : value;
}
