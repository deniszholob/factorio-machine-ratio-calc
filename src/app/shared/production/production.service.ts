import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, computed, signal } from '@angular/core';

import {
  Production as Production,
  MachineItem,
  newProduction,
} from 'src/app/components/production-chain-editor/production-editor/production.model';

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
      addUpMachineItems(machine.machineInputs, totals.inputs);
      addUpMachineItems(machine.machineOutputs, totals.outputs);
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
    this._$productions.set(machines);
  }

  public refreshMachines(): void {
    this._$productions.update((items) => [...items]);
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
