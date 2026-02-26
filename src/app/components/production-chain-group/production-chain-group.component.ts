import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  signal,
} from '@angular/core';

import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { ProductionChainItemComponent } from './production-chain-item/production-chain-item.component';
import { ModalComponent } from '../generic/modal/modal.component';
import { TooltipDirective } from '../generic/tooltip/tooltip.directive';
import { ProductionChain } from 'src/app/shared/models/production-chain/production-chain.model';
import { SettingsService } from 'src/app/shared/services/settings/settings.service';
import { ProductionCatalogUiService } from 'src/app/shared/services/production-catalog/production-catalog-ui.service';
import { FilePickerComponent } from 'src/app/forms/file-picker/file-picker.component';
import { ImportExportService } from 'src/app/shared/services/import-export/import-export.service';

@Component({
  selector: 'app-production-chain-group',
  templateUrl: './production-chain-group.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductionChainItemComponent,
    ModalComponent,
    TooltipDirective,
    FilePickerComponent,
  ],
})
export class ProductionChainGroupComponent {
  private readonly productionChainService = inject(ProductionChainService);
  private readonly settingsService = inject(SettingsService);
  private readonly productionCatalogUiService = inject(
    ProductionCatalogUiService,
  );
  private readonly importExportService = inject(ImportExportService);

  protected readonly $confirmResetOpen = signal<boolean>(false);
  protected readonly $uploadError = signal<string | undefined>(undefined);
  protected readonly productionChainFileAccept =
    this.importExportService.productionChainFileAccept;

  protected readonly $productions: Signal<ProductionChain[]> =
    this.productionChainService.$productionChains;
  protected readonly $activeProductionId: Signal<string | undefined> =
    this.productionChainService.$activeProductionChainId;
  protected readonly $editingProductionId: Signal<string | undefined> =
    this.productionChainService.$editingProductionChainId;
  protected readonly $editingName: Signal<string> =
    this.productionChainService.$editingProductionChainDisplay;
  protected readonly $editingIconUrl: Signal<string> =
    this.productionChainService.$editingProductionChainIconUrl;

  protected onAddProductionChain(): void {
    this.productionChainService.addProduction();
  }

  protected onOpenResetConfirm(): void {
    this.$confirmResetOpen.set(true);
  }

  protected onConfirmReset(): void {
    this.productionChainService.resetAllProductionChains();
    this.$confirmResetOpen.set(false);
  }

  protected onResetProductionChains(): void {
    this.onOpenResetConfirm();
  }

  protected onDeleteProductionChain(productionId: string): void {
    this.productionChainService.deleteProduction(productionId);
  }

  protected onDuplicateProductionChain(productionId: string): void {
    this.productionChainService.duplicateProductionChain(productionId);
  }

  protected onDownloadProductionChain(productionId: string): void {
    const productionChain = this.$productions().find(
      (chain) => chain.id === productionId,
    );
    if (!productionChain) {
      return;
    }

    this.importExportService.downloadProductionChain(productionChain);
  }

  protected onImportProductionChain(files: File[]): void {
    const mode = this.settingsService.$importChainsMode();
    this.importExportService
      .uploadProductionChain(files, mode)
      .then(() => {
        this.$uploadError.set(undefined);
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Failed to upload chain JSON';
        this.$uploadError.set(message);
      });
  }

  protected onSelectProductionChain(productionId: string): void {
    this.settingsService.closeSettings();
    this.productionCatalogUiService.closeCatalog();
    this.productionChainService.selectProduction(productionId);
  }

  protected onStartProductionChainRename(productionId: string): void {
    this.productionChainService.startRename(productionId);
  }

  protected onCancelProductionChainRename(): void {
    this.productionChainService.cancelRename();
  }

  protected onCommitProductionChainRename(): void {
    this.productionChainService.commitRename();
  }

  protected onEditProductionChainInput(value: string): void {
    this.productionChainService.updateEditingName(value);
  }

  protected onEditProductionChainIconInput(value: string): void {
    this.productionChainService.updateEditingIconUrl(value);
  }
}
