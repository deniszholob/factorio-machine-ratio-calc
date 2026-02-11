import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  effect,
  inject,
  signal,
} from '@angular/core';

import { FilePickerComponent } from '../../components/file-picker/file-picker.component';
import { ProductionGroupComponent } from './production-group/production-group.component';
import { Production } from './production-editor/production.model';
import {
  ProductionTotals,
  ProductionService,
} from 'src/app/shared/production/production.service';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';
import { ProductionEditorModalComponent } from './production-editor/production-editor-modal/production-editor-modal.component';

@Component({
  selector: 'app-production-chain-editor',
  templateUrl: './production-chain-editor.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductionGroupComponent,
    ProductionEditorModalComponent,
    FilePickerComponent,
  ],
})
export class ProductionChainEditorComponent {
  private readonly productionService = inject(ProductionService);
  private readonly importExportService = inject(ImportExportService);
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $machines: Signal<Production[]> =
    this.productionService.$productions;
  protected readonly $machineTotals: Signal<ProductionTotals> =
    this.productionService.$machineTotals;

  protected readonly $machineToEdit = signal<Production | undefined>(undefined);
  protected readonly $isEditorOpen = signal<boolean>(false);
  protected readonly $errorMessage = signal<string | undefined>(undefined);

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
    this.$machineToEdit.set(machine);
    this.$isEditorOpen.set(true);
  }

  protected onDeleteMachine(index: number): void {
    this.productionService.deleteMachineAt(index);
  }

  protected onClearAll(): void {
    this.productionService.clearMachines();
  }

  protected onDrop(event: CdkDragDrop<Production[]>): void {
    this.productionService.moveMachine(event.previousIndex, event.currentIndex);
  }

  protected onEditorVisibilityChange(isOpen: boolean): void {
    this.$isEditorOpen.set(isOpen);
    if (!isOpen) {
      this.$machineToEdit.set(undefined);
      this.onEditFinish();
    }
  }

  protected uploadData(files: File[]): void {
    this.importExportService
      .uploadProductionChainById(files)
      .then(() => {
        this.$errorMessage.set(undefined);
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        console.log(error);
        this.$errorMessage.set('Error reading file, see console for details');
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
