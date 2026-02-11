import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Signal, effect, inject, viewChild } from '@angular/core';

import { FilePickerComponent } from '../../components/file-picker/file-picker.component';
import { ProductionEntryComponent } from '../../components/production-entry/production-entry.component';
import { ProductionModalComponent } from '../../components/production-modal/production-modal.component';
import { Machine } from '../../components/production-modal/production.model';
import {
  MachineTotals,
  ProductionService,
} from 'src/app/shared/production/production.service';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';

const DOWNLOAD_FILE_PREFIX = `PRC`;

@Component({
  selector: 'app-production-view',
  templateUrl: './production-view.component.html',
  host: { class: 'contents' },
  imports: [
    CommonModule,
    ProductionEntryComponent,
    ProductionModalComponent,
    FilePickerComponent,
    // CDK
    DragDropModule,
    CdkDropList,
  ],
})
export class ProductionViewComponent {
  protected readonly productionService = inject(ProductionService);
  protected readonly importExportService = inject(ImportExportService);
  // protected readonly $importPicker =
  //   viewChild<FilePickerComponent>('importPicker');

  protected readonly $machines: Signal<Machine[]> =
    this.productionService.$machines;
  protected readonly $machineTotals: Signal<MachineTotals> =
    this.productionService.$machineTotals;

  public machineToEdit?: Machine;
  public modalOpen: boolean = false;
  public errorMessage?: string;

  // private readonly importRequestEffect = effect(() => {
  //   const requestCount = this.importExportService.$importRequest();
  //   const importPicker = this.$importPicker();

  //   if (requestCount > 0 && importPicker) {
  //     importPicker.open();
  //   }
  // });

  // private readonly exportRequestEffect = effect(() => {
  //   const requestCount = this.importExportService.$exportRequest();

  //   if (requestCount > 0) {
  //     this.downloadData();
  //   }
  // });

  protected onAddMachine(): void {
    const machine = this.productionService.addMachine();
    this.onEditMachine(machine);
  }

  protected onEditFinish(): void {
    setTimeout(() => {
      this.productionService.refreshMachines();
    }, 1);
  }

  protected onEditMachine(machine: Machine): void {
    this.machineToEdit = machine;
    this.modalOpen = true;
  }

  protected onDeleteMachine(index: number): void {
    this.productionService.deleteMachineAt(index);
  }

  protected onClearAll(): void {
    this.productionService.clearMachines();
  }

  protected openModal(): void {
    this.modalOpen = true;
  }

  protected drop(event: CdkDragDrop<Machine[]>): void {
    this.productionService.moveMachine(event.previousIndex, event.currentIndex);
  }

  protected uploadData(files: File[]): void {
    const selectedFile: File = files[0];
    this.readFile(selectedFile);
  }

  /* TODO: Generalize and extract to the import/export service */
  private readFile(file: File): void {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      const fileResult: string | undefined = fileReader.result?.toString();
      const stringified = fileResult ? JSON.parse(fileResult) : undefined;
      // console.log(stringified);
      this.productionService.setMachines(stringified ?? []);
      this.onEditFinish();
    };
    fileReader.onerror = (error) => {
      console.log(error);
      this.errorMessage = 'Error reading file, see console for details';
    };
  }

  protected downloadData(): void {
    const data: string = JSON.stringify(this.$machines());
    // this.downloadFile(data);
    this.downloadJson(data);
  }

  /* TODO: Generalize and extract to the import/export service */
  private downloadJson(sJson: string): void {
    const element: HTMLAnchorElement = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson),
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
