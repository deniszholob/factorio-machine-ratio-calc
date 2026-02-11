import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, computed, signal } from '@angular/core';

import {
  Machine,
  MachineItem,
  newMachine,
} from 'src/app/components/production-modal/production.model';

export interface MachineTotals {
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
  private readonly _$machines = signal<Machine[]>([]);
  public readonly $machines = this._$machines.asReadonly();

  public readonly $machineTotals = computed<MachineTotals>(() => {
    const machines = this.$machines();

    const totals: MachineTotals = {
      deltas: [],
      inputs: [],
      outputs: [],
    };

    for (const machine of machines) {
      this.addUpMachineItems(machine.machineInputs, totals.inputs);
      this.addUpMachineItems(machine.machineOutputs, totals.outputs);
    }

    this.addUpTotals(totals.outputs, totals.deltas, 1);
    this.addUpTotals(totals.inputs, totals.deltas, -1);

    return totals;
  });

  public addMachine(): Machine {
    const machine = newMachine();
    this._$machines.update((items) => [...items, machine]);
    return machine;
  }

  public setMachines(machines: Machine[]): void {
    this._$machines.set(machines);
  }

  public refreshMachines(): void {
    this._$machines.update((items) => [...items]);
  }

  public deleteMachineAt(index: number): void {
    this._$machines.update((items) => {
      if (index < 0 || index >= items.length) {
        return items;
      }
      const nextItems = [...items];
      nextItems.splice(index, 1);
      return nextItems;
    });
  }

  public moveMachine(previousIndex: number, currentIndex: number): void {
    this._$machines.update((items) => {
      const nextItems = [...items];
      moveItemInArray(nextItems, previousIndex, currentIndex);
      // const [movedItem] = nextItems.splice(previousIndex, 1);
      // nextItems.splice(currentIndex, 0, movedItem);
      return nextItems;
    });
  }

  public clearMachines(): void {
    this._$machines.set([]);
  }

  private addUpMachineItems(
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

  private addUpTotals(
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
}
