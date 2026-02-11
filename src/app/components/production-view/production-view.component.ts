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
import { Production } from '../../components/production-modal/production.model';
import {
  ProductionTotals,
  ProductionService,
} from 'src/app/shared/production/production.service';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';

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
  private readonly productionService = inject(ProductionService);
  private readonly importExportService = inject(ImportExportService);
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $machines: Signal<Production[]> =
    this.productionService.$productions;
  protected readonly $machineTotals: Signal<ProductionTotals> =
    this.productionService.$machineTotals;

  public machineToEdit?: Production;
  public modalOpen: boolean = false;
  public errorMessage?: string;

  public constructor() {
    effect(() => {
      const machines = this.$machines();
      this.productionChainService.setActiveChainProductions(machines);
    });
  }

  protected onAddMachine(): void {
    const machine = this.productionService.addMachine();
    this.onEditMachine(machine);
  }

  protected onEditFinish(): void {
    setTimeout(() => {
      this.productionService.refreshMachines();
    }, 1);
  }

  protected onEditMachine(machine: Production): void {
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

  protected drop(event: CdkDragDrop<Production[]>): void {
    this.productionService.moveMachine(event.previousIndex, event.currentIndex);
  }

  protected uploadData(files: File[]): void {
    this.importExportService
      .uploadProductionChainById(files)
      .then(() => {
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        console.log(error);
        this.errorMessage = 'Error reading file, see console for details';
      });
  }

  protected downloadData(): void {
    const activeChainId =
      this.productionChainService.getActiveProductionChainId();
    if (!activeChainId) {
      return;
    }

    this.importExportService.downloadProductionChainById(
      activeChainId,
      this.$machines(),
    );
  }

  // private downloadFile(data: string): void {
  //   const blob = new Blob([data], { type: 'text/json' });
  //   const url: string = window.URL.createObjectURL(blob);
  //   window.open(url);
  // }
}
