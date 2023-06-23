import {
  CdkDrag,
  CdkDragDrop,
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
  newMachine,
} from '../../components/production-modal/production.model';

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
    CdkDragPlaceholder,
  ],
  templateUrl: './production-view.component.html',
})
export class ProductionViewComponent {
  public machines: Machine[] = [];
  public machineToEdit?: Machine;
  public modalOpen: boolean = false;
  public errorMessage?: string;

  public onAddMachine(): void {
    this.machines.push(newMachine());
    this.onEditMachine(this.machines[this.machines.length - 1]);
  }

  public onEditMachine(machine: Machine): void {
    this.machineToEdit = machine;
    this.modalOpen = true;
  }

  public onDeleteMachine(index: number): void {
    if (index > -1) {
      this.machines.splice(index, 1);
    }
  }

  public onClearAll(): void {
    this.machines = [];
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
    element.setAttribute('download', 'machine-ratio-calc-data.json');
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
