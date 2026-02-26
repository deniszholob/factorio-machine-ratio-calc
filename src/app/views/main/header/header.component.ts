import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { ImportExportService } from 'src/app/shared/services/import-export/import-export.service';
import { ProductionCatalogUiService } from 'src/app/shared/services/production-catalog/production-catalog-ui.service';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { SettingsService } from 'src/app/shared/services/settings/settings.service';
import { TooltipDirective } from '../../../components/generic/tooltip/tooltip.directive';
import { FilePickerComponent } from '../../../forms/file-picker/file-picker.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, NgOptimizedImage, FilePickerComponent, NgClass],
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly importExportService: ImportExportService =
    inject(ImportExportService);
  private readonly settingsService = inject(SettingsService);
  private readonly productionChainService = inject(ProductionChainService);
  private readonly productionCatalogUiService = inject(
    ProductionCatalogUiService,
  );
  protected readonly $isSettingsOpen = this.settingsService.$isSettingsOpen;
  protected readonly $isCatalogOpen =
    this.productionCatalogUiService.$isCatalogOpen;
  protected readonly $uploadError = signal<string | undefined>(undefined);
  protected readonly productionChainFileAccept =
    this.importExportService.productionChainFileAccept;

  protected onGoHome(): void {
    this.productionChainService.clearActiveProductionChain();
    this.router.navigateByUrl('/');
  }

  protected onImportProductionChains(files: File[]): void {
    const mode = this.settingsService.$importChainsMode();
    this.importExportService
      .uploadAllProductionChains(files, mode)
      .then(() => {
        this.$uploadError.set(undefined);
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Failed to upload JSON';
        this.$uploadError.set(message);
      });
  }

  protected onExportProductionChains(): void {
    this.importExportService.downloadAllProductionChains();
  }

  protected onToggleSettings(): void {
    if (this.productionCatalogUiService.$isCatalogOpen()) {
      this.productionCatalogUiService.closeCatalog();
    }
    this.settingsService.toggleSettings();
  }

  protected onToggleCatalog(): void {
    if (this.settingsService.$isSettingsOpen()) {
      this.settingsService.closeSettings();
    }
    this.productionCatalogUiService.toggleCatalog();
  }
}
