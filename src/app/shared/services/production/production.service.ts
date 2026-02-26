import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, computed, signal } from '@angular/core';

import {
  newProduction,
  normalizeProduction,
} from 'src/app/components/production/production-chain-editor/production-editor/production.util';
import { guid } from 'src/app/shared/utils/guid/guid.util';
import {
  collectSubtreeIds,
  collectSubtreeItemsInOrder,
} from './production-tree-dnd.util';
import { MachineItem } from '../../models/production-chain/production/machine-item/machine-item.model';
import { Production } from '../../models/production-chain/production/production.model';

export interface ProductionTotals {
  deltas: TotalRate[];
  inputs: TotalRate[];
  outputs: TotalRate[];
}

export interface TotalRate {
  name: string;
  totalRate: number;
}

@Injectable({ providedIn: 'root' })
export class ProductionService {
  private readonly _$productions = signal<Production[]>([]);
  public readonly $productions = this._$productions.asReadonly();

  public readonly $machineTotals = computed<ProductionTotals>(() => {
    const productions = this.$productions();

    const totals: ProductionTotals = {
      deltas: [],
      inputs: [],
      outputs: [],
    };

    for (const machine of productions) {
      addUpMachineItems(machine.recipe.inputs, totals.inputs);
      addUpMachineItems(machine.recipe.outputs, totals.outputs);
    }

    addUpTotals(totals.outputs, totals.deltas, 1);
    addUpTotals(totals.inputs, totals.deltas, -1);

    return totals;
  });

  public addMachine(): Production {
    const machine = newProduction();
    this._$productions.update((items) => [...items, machine]);
    return machine;
  }

  public setMachines(machines: Production[]): void {
    const nextMachines = this.ensureProductionIds(machines);
    const currentMachines = this.$productions();
    if (
      serializeProductions(currentMachines) ===
      serializeProductions(nextMachines)
    ) {
      return;
    }
    this._$productions.set(nextMachines);
  }

  public refreshMachines(): void {
    this._$productions.update((items) => [...items]);
  }

  public updateMachine(updated: Production): void {
    this._$productions.update((items) => {
      const normalized = normalizeProduction(updated);
      const machineNameKey = toNameKey(normalized.machine.name);
      const recipeNameKey = toNameKey(normalized.recipe.name);
      const recipeInputs = normalized.recipe.inputs.map((item) => ({ ...item }));
      const recipeOutputs = normalized.recipe.outputs.map((item) => ({ ...item }));

      return items.map((item) => {
        let nextItem: Production = item;
        const isTarget = item.id === updated.id;
        if (isTarget) {
          nextItem = { ...normalized, id: item.id };
        }

        if (
          machineNameKey &&
          toNameKey(nextItem.machine.name) === machineNameKey
        ) {
          nextItem = {
            ...nextItem,
            machine: {
              ...nextItem.machine,
              craftingSpeed: normalized.machine.craftingSpeed,
              productivity: normalized.machine.productivity,
              drain: normalized.machine.drain,
            },
          };
        }

        if (recipeNameKey && toNameKey(nextItem.recipe.name) === recipeNameKey) {
          nextItem = {
            ...nextItem,
            recipe: {
              ...nextItem.recipe,
              iconUrl: normalized.recipe.iconUrl,
              timeToComplete: normalized.recipe.timeToComplete,
              inputs: recipeInputs.map((recipeItem) => ({ ...recipeItem })),
              outputs: recipeOutputs.map((recipeItem) => ({ ...recipeItem })),
            },
          };
        }

        if (nextItem === item) {
          return item;
        }
        const normalizedNext = normalizeProduction(nextItem);
        return { ...normalizedNext, id: item.id };
      });
    });
  }

  public updateMachineParent(
    machineId: string,
    parentProductionId: string | undefined,
  ): void {
    this._$productions.update((items) => {
      const nextParentId = parentProductionId?.trim() || undefined;
      const target = items.find((item) => item.id === machineId);
      if (!target) {
        return items;
      }
      if (nextParentId && !isValidParent(items, machineId, nextParentId)) {
        return items;
      }
      return items.map((item) =>
        item.id === machineId
          ? { ...item, parentProductionId: nextParentId }
          : item,
      );
    });
  }

  public toggleMachineExpanded(machineId: string): void {
    this._$productions.update((items) =>
      items.map((item) =>
        item.id === machineId
          ? { ...item, isExpanded: !item.isExpanded }
          : item,
      ),
    );
  }

  public duplicateMachine(source: Production): Production {
    const duplicated: Production = {
      ...normalizeProduction(source),
      id: guid(),
      recipe: {
        ...source.recipe,
        inputs: source.recipe.inputs.map((item) => ({ ...item })),
        outputs: source.recipe.outputs.map((item) => ({ ...item })),
      },
      machine: { ...source.machine },
    };
    this._$productions.update((items) => [...items, duplicated]);
    return duplicated;
  }

  public deleteMachineAt(index: number): void {
    this._$productions.update((items) => {
      if (index < 0 || index >= items.length) {
        return items;
      }
      const nextItems = [...items];
      nextItems.splice(index, 1);
      return nextItems;
    });
  }

  public deleteMachineById(machineId: string): void {
    this._$productions.update((items) => {
      const target = items.find((item) => item.id === machineId);
      if (!target) {
        return items;
      }

      return items
        .filter((item) => item.id !== machineId)
        .map((item) =>
          item.parentProductionId === machineId
            ? { ...item, parentProductionId: target.parentProductionId }
            : item,
        );
    });
  }

  public moveMachine(previousIndex: number, currentIndex: number): void {
    this._$productions.update((items) => {
      const nextItems = [...items];
      moveItemInArray(nextItems, previousIndex, currentIndex);
      // const [movedItem] = nextItems.splice(previousIndex, 1);
      // nextItems.splice(currentIndex, 0, movedItem);
      return nextItems;
    });
  }

  public moveMachineById(
    machineId: string,
    beforeMachineId: string | undefined,
    parentProductionId: string | undefined,
  ): void {
    /**
     * Moves a production as a subtree:
     * - root + descendants are removed together
     * - root parent is updated to the new target parent
     * - subtree is reinserted in stable DFS order
     */
    this._$productions.update((items) => {
      const source = items.find((item) => item.id === machineId);
      if (!source) {
        return items;
      }

      const nextParentId = parentProductionId?.trim() || undefined;
      if (nextParentId && !isValidParent(items, machineId, nextParentId)) {
        return items;
      }

      const subtreeIds = collectSubtreeIds(items, machineId);
      const movedItems = collectSubtreeItemsInOrder(items, machineId);
      const nextItems = items.filter((item) => !subtreeIds.has(item.id));

      const targetIndex = beforeMachineId
        ? nextItems.findIndex((item) => item.id === beforeMachineId)
        : -1;

      const movedWithParent = movedItems.map((item) =>
        item.id === machineId
          ? { ...item, parentProductionId: nextParentId }
          : item,
      );

      if (targetIndex === -1) {
        nextItems.push(...movedWithParent);
      } else {
        nextItems.splice(targetIndex, 0, ...movedWithParent);
      }

      return nextItems;
    });
  }

  public clearMachines(): void {
    this._$productions.set([]);
  }

  private ensureProductionIds(machines: Production[]): Production[] {
    const normalized = machines.map((machine) => {
      const normalized = normalizeProduction(machine);
      return normalized.id ? normalized : { ...normalized, id: guid() };
    });
    return sanitizeParentReferences(normalized);
  }
}

function serializeProductions(machines: Production[]): string {
  return JSON.stringify(machines);
}

function toNameKey(value: string): string {
  return value.trim().toLowerCase();
}

function sanitizeParentReferences(productions: Production[]): Production[] {
  const validIds = new Set(productions.map((production) => production.id));
  return productions.map((production) => {
    const parentId = production.parentProductionId;
    if (!parentId || !validIds.has(parentId) || parentId === production.id) {
      return {
        ...production,
        parentProductionId: undefined,
      };
    }
    return production;
  });
}

/**
 * Guards against invalid parent assignments:
 * - cannot parent to self
 * - cannot parent under any own descendant (cycle)
 */
function isValidParent(
  productions: Production[],
  machineId: string,
  parentId: string,
): boolean {
  if (machineId === parentId) {
    return false;
  }
  const byId = new Map(
    productions.map((production) => [production.id, production]),
  );
  let cursor = byId.get(parentId);
  while (cursor) {
    if (cursor.id === machineId) {
      return false;
    }
    cursor = cursor.parentProductionId
      ? byId.get(cursor.parentProductionId)
      : undefined;
  }
  return true;
}

// #region Helpers
function addUpMachineItems(
  items: MachineItem[],
  totals: TotalRate[],
  sign: 1 | -1 = 1,
): void {
  for (const item of items) {
    const existingInputIdx = totals.findIndex(
      (totalItem) => totalItem.name === item.name,
    );
    if (existingInputIdx !== -1) {
      totals[existingInputIdx].totalRate += item.totalRate * sign;
    } else {
      totals.push({
        name: item.name,
        totalRate: item.totalRate * sign,
      });
    }
  }
}

function addUpTotals(
  items: TotalRate[],
  totals: TotalRate[],
  sign: 1 | -1 = 1,
): void {
  for (const item of items) {
    const existingInputIdx = totals.findIndex(
      (totalItem) => totalItem.name === item.name,
    );
    if (existingInputIdx !== -1) {
      totals[existingInputIdx].totalRate += item.totalRate * sign;
    } else {
      totals.push({
        name: item.name,
        totalRate: item.totalRate * sign,
      });
    }
  }
}
// #endregion
