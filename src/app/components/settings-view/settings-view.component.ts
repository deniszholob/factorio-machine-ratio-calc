import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import {
  EditorDisplayMode,
  SettingsService,
} from 'src/app/shared/services/settings/settings.service';
import { ContentLayoutComponent } from 'src/app/layouts/content-layout/content-layout.component';
import {
  SelectionListComponent,
  SelectionListOption,
} from 'src/app/forms/selection-list/selection-list.component';
import { ImportMode } from 'src/app/shared/models/import-mode.enum';
import { SelectionListType } from 'src/app/forms/selection-list/selection-list.component';
import { ProductionCatalogService } from 'src/app/shared/services/production-catalog/production-catalog.service';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { ModalComponent } from '../generic/modal/modal.component';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContentLayoutComponent, SelectionListComponent, ModalComponent],
})
export class SettingsViewComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly productionCatalogService = inject(ProductionCatalogService);
  private readonly productionChainService = inject(ProductionChainService);
  protected readonly SelectionListType = SelectionListType;

  protected readonly $editorDisplayMode =
    this.settingsService.$editorDisplayMode;
  protected readonly $importChainsMode = this.settingsService.$importChainsMode;
  protected readonly $importProductionsMode =
    this.settingsService.$importProductionsMode;
  protected readonly $defaultEditorDisplayMode =
    this.settingsService.defaultSettings.editorDisplayMode;
  protected readonly $defaultImportChainsMode =
    this.settingsService.defaultSettings.importChainsMode;
  protected readonly $defaultImportProductionsMode =
    this.settingsService.defaultSettings.importProductionsMode;
  protected readonly $isResetSettingsConfirmOpen = signal<boolean>(false);
  protected readonly $isClearDataConfirmOpen = signal<boolean>(false);
  protected readonly editorDisplayOptions: readonly SelectionListOption<EditorDisplayMode>[] =
    [
    {
      id: EditorDisplayMode.Modal,
      display: 'Modal Popup',
      description: 'Keep focus in a dialog overlay.',
    },
    {
      id: EditorDisplayMode.Sidebar,
      display: 'Right Sidebar',
      description: 'Slide out editor beside the list.',
    },
    {
      id: EditorDisplayMode.Full,
      display: 'Full Main Content',
      description: 'Replace the list with the editor.',
    },
    ];
  protected readonly importBehaviorOptions: readonly SelectionListOption<ImportMode>[] =
    [
      {
        id: ImportMode.Add,
        display: 'Add',
        description: 'Merge uploads alongside existing data.',
      },
      {
        id: ImportMode.Override,
        display: 'Override',
        description: 'Replace existing data when names match.',
      },
    ];

  protected setEditorDisplayMode(mode: EditorDisplayMode | undefined): void {
    if (!mode) {
      return;
    }
    this.settingsService.setEditorDisplayMode(mode);
  }

  protected setImportChainsMode(mode: ImportMode | undefined): void {
    if (!mode) {
      return;
    }
    this.settingsService.setImportChainsMode(mode);
  }

  protected setImportProductionsMode(mode: ImportMode | undefined): void {
    if (!mode) {
      return;
    }
    this.settingsService.setImportProductionsMode(mode);
  }

  protected onClose(): void {
    this.settingsService.closeSettings();
  }

  protected onRequestResetSettings(): void {
    this.$isResetSettingsConfirmOpen.set(true);
  }

  protected onConfirmResetSettings(): void {
    this.settingsService.resetSettings();
  }

  protected onCancelResetSettings(): void {
    this.$isResetSettingsConfirmOpen.set(false);
  }

  protected onRequestClearAllData(): void {
    this.$isClearDataConfirmOpen.set(true);
  }

  protected onConfirmClearAllData(): void {
    this.productionCatalogService.clearCatalog();
    this.productionChainService.resetAllProductionChains();
  }

  protected onCancelClearAllData(): void {
    this.$isClearDataConfirmOpen.set(false);
  }
}
