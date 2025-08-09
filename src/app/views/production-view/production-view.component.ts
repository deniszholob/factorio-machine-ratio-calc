import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FilePickerComponent } from '../../components/file-picker/file-picker.component';
import { ProductionEntryComponent } from '../../components/production-entry/production-entry.component';
import { ProductionModalComponent } from '../../components/production-modal/production-modal.component';
import {
  Machine,
  MachineItem,
  newMachine,
} from '../../components/production-modal/production.model';

interface MachineTotals {
  deltas: TotalRate[];
  inputs: TotalRate[];
  outputs: TotalRate[];
}

interface TotalRate {
  name: string;
  totalRate: number;
}

function totalsSort(a: TotalRate, b: TotalRate): number {
  const alphabetical = a.name.localeCompare(b.name);
  const numeric = a.totalRate - b.totalRate;
  const sort = alphabetical;
  return sort;
}
const DOWNLOAD_FILE_PREFIX = `PRC`;

@Component({
  selector: 'app-production-view',
  standalone: true,
  imports: [
    CommonModule,
    ProductionEntryComponent,
    ProductionModalComponent,
    FilePickerComponent,

    // CDK
    DragDropModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  templateUrl: './production-view.component.html',
})
export class ProductionViewComponent {
  public machines: Machine[] = [];
  public machineToEdit?: Machine;
  public modalOpen: boolean = false;
  public errorMessage?: string;

  public machinesTotals: MachineTotals = {
    deltas: [],
    inputs: [],
    outputs: [],
  };

  public onAddMachine(): void {
    this.machines.push(newMachine());
    this.onEditMachine(this.machines[this.machines.length - 1]);
  }

  private updateTotals(): void {
    // console.log(`updateTotals`, this.machines);
    this.machinesTotals.inputs = [];
    this.machinesTotals.outputs = [];
    this.machinesTotals.deltas = [];
    // debugger;
    for (const m of this.machines) {
      this.addUpTotalItems(m.machineInputs, this.machinesTotals.inputs);
      this.addUpTotalItems(m.machineOutputs, this.machinesTotals.outputs);
    }

    // this.machinesTotals.inputs.sort(totalsSort);
    // this.machinesTotals.outputs.sort(totalsSort);

    this.addUpTotalItems(
      this.machinesTotals.outputs,
      this.machinesTotals.deltas,
      1
    );
    this.addUpTotalItems(
      this.machinesTotals.inputs,
      this.machinesTotals.deltas,
      -1
    );
    // this.machinesTotals.deltas.sort(totalsSort);

    // console.log(`machinesTotals`, this.machinesTotals);
  }

  private addUpTotalItems(
    items: TotalRate[],
    totals: TotalRate[],
    sign: 1 | -1 = 1
  ): void {
    for (const mI of items) {
      const existingInputIdx = totals.findIndex((tI) => tI.name === mI.name);
      existingInputIdx !== -1
        ? (totals[existingInputIdx].totalRate += mI.totalRate * sign)
        : totals.push({
            name: mI.name,
            totalRate: mI.totalRate * sign,
          });
    }
  }

  protected onEditFinish(): void {
    setTimeout(() => {
      this.updateTotals();
    }, 1);
  }

  public onEditMachine(machine: Machine): void {
    this.machineToEdit = machine;
    this.modalOpen = true;
  }

  public onDeleteMachine(index: number): void {
    if (index > -1) {
      this.machines.splice(index, 1);
    }
    this.updateTotals();
  }

  public onClearAll(): void {
    this.machines = [];
    this.updateTotals();
  }

  public openModal(): void {
    this.modalOpen = true;
  }

  public drop(event: CdkDragDrop<Machine[]>): void {
    moveItemInArray(this.machines, event.previousIndex, event.currentIndex);
  }

  public uploadData(files: File[]): void {
    const selectedFile: File = files[0];
    this.readFile(selectedFile);
  }

  private readFile(file: File): void {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      const fileResult: string | undefined = fileReader.result?.toString();
      const stringified = fileResult ? JSON.parse(fileResult) : undefined;
      // console.log(stringified);
      this.machines = stringified ?? [];
      this.onEditFinish();
    };
    fileReader.onerror = (error) => {
      console.log(error);
      this.errorMessage = 'Error reading file, see console for details';
    };
  }

  public downloadData(): void {
    const data: string = JSON.stringify(this.machines);
    // this.downloadFile(data);
    this.downloadJson(data);
  }

  private downloadJson(sJson: string): void {
    const element: HTMLAnchorElement = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson)
    );
    element.setAttribute('download', `${DOWNLOAD_FILE_PREFIX}_data.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // private downloadFile(data: string): void {
  //   const blob = new Blob([data], { type: 'text/json' });
  //   const url: string = window.URL.createObjectURL(blob);
  //   window.open(url);
  // }
}
