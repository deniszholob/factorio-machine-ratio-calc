import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FilePickerComponent } from '../../../forms/file-picker/file-picker.component';
import { ProductionGroupComponent } from './production-group/production-group.component';
import {
  ProductionTotals,
  ProductionService,
} from 'src/app/shared/services/production/production.service';
import { ImportExportService } from 'src/app/shared/services/import-export/import-export.service';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { ProductionEditorModalComponent } from './production-editor/production-editor-modal/production-editor-modal.component';
import { ProductionEditorSidebarComponent } from './production-editor/production-editor-sidebar/production-editor-sidebar.component';
import { ProductionEditorFullComponent } from './production-editor/production-editor-full/production-editor-full.component';
import {
  EditorDisplayMode,
  SettingsService,
} from 'src/app/shared/services/settings/settings.service';
import { ContentLayoutComponent } from 'src/app/layouts/content-layout/content-layout.component';
import { ProductionCatalogService } from 'src/app/shared/services/production-catalog/production-catalog.service';
import { SelectSingleIconInputComponent } from 'src/app/forms/select-single-icon-input/select-single-icon-input.component';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';
import { ModalComponent } from 'src/app/components/generic/modal/modal.component';

@Component({
  selector: 'app-production-chain-editor',
  templateUrl: './production-chain-editor.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContentLayoutComponent,
    ProductionGroupComponent,
    ProductionEditorModalComponent,
    ProductionEditorSidebarComponent,
    ProductionEditorFullComponent,
    FilePickerComponent,
    SelectSingleIconInputComponent,
    ModalComponent,
  ],
})
export class ProductionChainEditorComponent {
  protected readonly EditorDisplayMode = EditorDisplayMode;

  private readonly productionService = inject(ProductionService);
  private readonly importExportService = inject(ImportExportService);
  private readonly productionChainService = inject(ProductionChainService);
  private readonly settingsService = inject(SettingsService);
  private readonly productionCatalogService = inject(ProductionCatalogService);

  protected readonly $machines: Signal<Production[]> =
    this.productionService.$productions;
  protected readonly $machineTotals: Signal<ProductionTotals> =
    this.productionService.$machineTotals;

  protected readonly $machineToEdit = signal<Production | undefined>(undefined);
  protected readonly $machineDraft = signal<Production | undefined>(undefined);
  protected readonly $isEditorOpen = signal<boolean>(false);
  protected readonly $errorMessage = signal<string | undefined>(undefined);
  protected readonly $editorDisplayMode =
    this.settingsService.$editorDisplayMode;
  protected readonly $productionTemplateNames =
    this.productionCatalogService.$productionNames;
  protected readonly $productionTemplateIconsByName =
    this.productionCatalogService.$productionIconsByName;
  protected readonly $selectedProductionTemplateName = signal<string>('');
  protected readonly $isAddFromCatalogModalOpen = signal<boolean>(false);
  protected readonly $activeChainName =
    this.productionChainService.$activeProductionName;
  protected readonly productionFileAccept =
    this.importExportService.productionFileAccept;
  protected readonly $editorSubtitle = computed(() => {
    const machine = this.$machineDraft();
    if (machine && this.$isEditorOpen()) {
      return `${machine.name || 'Untitled Production'}`;
    }
    const chainName = this.$activeChainName();
    return chainName ? `${chainName}` : undefined;
  });

  protected onAddMachine(): void {
    const machine = this.productionService.addMachine();
    this.syncActiveChainProductions();
    this.onEditMachine(machine);
  }

  protected onProductionTemplateNameChange(value: string): void {
    this.$selectedProductionTemplateName.set(value);
  }

  protected onOpenAddMachineFromCatalogModal(): void {
    this.$isAddFromCatalogModalOpen.set(true);
  }

  protected onCloseAddMachineFromCatalogModal(): void {
    this.$isAddFromCatalogModalOpen.set(false);
    this.$selectedProductionTemplateName.set('');
  }

  protected onAddMachineFromCatalog(): void {
    const selectedName = this.$selectedProductionTemplateName().trim();
    if (!selectedName) {
      return;
    }

    const template =
      this.productionCatalogService.getProductionTemplateByName(selectedName);
    if (!template) {
      return;
    }

    const machine = this.productionService.addMachine();
    this.productionService.updateMachine({
      ...template.production,
      id: machine.id,
    });
    this.syncActiveChainProductions();
    this.onCloseAddMachineFromCatalogModal();
  }

  protected onEditFinish(): void {
    setTimeout(() => {
      this.productionService.refreshMachines();
      this.syncActiveChainProductions();
    }, 1);
  }

  protected onEditMachine(machine: Production): void {
    this.$machineToEdit.set(machine);
    this.$machineDraft.set(this.cloneMachine(machine));
    this.$isEditorOpen.set(true);
  }

  protected onDeleteMachineById(machineId: string): void {
    this.productionService.deleteMachineById(machineId);
    this.syncActiveChainProductions();
  }

  protected onDuplicateMachine(machine: Production): void {
    const duplicated = this.productionService.duplicateMachine(machine);
    this.syncActiveChainProductions();
    this.onEditMachine(duplicated);
  }

  protected onDownloadMachine(machine: Production): void {
    this.importExportService.downloadProductionById(machine.id, machine);
  }

  protected onClearAll(): void {
    this.productionService.clearMachines();
    this.syncActiveChainProductions();
  }

  protected onMoveMachine(event: {
    machineId: string;
    beforeMachineId?: string;
    parentProductionId?: string;
  }): void {
    this.productionService.moveMachineById(
      event.machineId,
      event.beforeMachineId,
      event.parentProductionId,
    );
    this.syncActiveChainProductions();
  }

  protected onToggleMachineExpanded(machineId: string): void {
    this.productionService.toggleMachineExpanded(machineId);
    this.syncActiveChainProductions();
  }

  protected onAddChildMachine(parentMachineId: string): void {
    const machine = this.productionService.addMachine();
    this.productionService.updateMachineParent(machine.id, parentMachineId);
    this.syncActiveChainProductions();
    this.onEditMachine(machine);
  }

  protected onEditorVisibilityChange(isOpen: boolean): void {
    if (!isOpen) {
      this.onEditorClosed();
      return;
    }
    this.$isEditorOpen.set(true);
  }

  protected onEditorClosed(): void {
    const draft = this.$machineDraft();
    if (draft) {
      this.productionService.updateMachine(draft);
      this.syncActiveChainProductions();
    }
    this.$machineDraft.set(undefined);
    this.$machineToEdit.set(undefined);
    this.$isEditorOpen.set(false);
  }

  protected onDraftMachineChanged(machine: Production): void {
    this.productionService.updateMachine(machine);
    this.syncActiveChainProductions();
  }

  private cloneMachine(machine: Production): Production {
    if (typeof structuredClone === 'function') {
      return structuredClone(machine);
    }
    return JSON.parse(JSON.stringify(machine)) as Production;
  }

  protected uploadData(files: File[]): void {
    const mode = this.settingsService.$importProductionsMode();
    const activeChainId =
      this.productionChainService.getActiveProductionChainId();
    this.importExportService
      .uploadProductionChainById(files, mode, activeChainId)
      .then(() => {
        this.$errorMessage.set(undefined);
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Error reading upload file';
        this.$errorMessage.set(message);
      });
  }

  protected downloadData(): void {
    this.importExportService.downloadProductions(this.$machines());
  }

  protected closeEditor(): void {
    this.onEditorVisibilityChange(false);
  }

  private syncActiveChainProductions(): void {
    this.productionChainService.setActiveChainProductions(this.$machines());
  }

  // private downloadFile(data: string): void {
  //   const blob = new Blob([data], { type: 'text/json' });
  //   const url: string = window.URL.createObjectURL(blob);
  //   window.open(url);
  // }
}
