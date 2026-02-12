import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, computed, signal } from '@angular/core';

import {
  Production as Production,
  MachineItem,
  newProduction,
  normalizeProduction,
} from 'src/app/components/production-chain-editor/production-editor/production.model';
import { guid } from 'src/app/shared/guid/guid.util';

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
      return items.map((item) =>
        item.id === updated.id ? { ...normalized, id: item.id } : item,
      );
    });
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

  public moveMachine(previousIndex: number, currentIndex: number): void {
    this._$productions.update((items) => {
      const nextItems = [...items];
      moveItemInArray(nextItems, previousIndex, currentIndex);
      // const [movedItem] = nextItems.splice(previousIndex, 1);
      // nextItems.splice(currentIndex, 0, movedItem);
      return nextItems;
    });
  }

  public clearMachines(): void {
    this._$productions.set([]);
  }

  private ensureProductionIds(machines: Production[]): Production[] {
    return machines.map((machine) => {
      const normalized = normalizeProduction(machine);
      return normalized.id ? normalized : { ...normalized, id: guid() };
    });
  }
}

function serializeProductions(machines: Production[]): string {
  return JSON.stringify(machines);
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
