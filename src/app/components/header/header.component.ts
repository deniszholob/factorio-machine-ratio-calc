import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ImportExportService } from 'src/app/shared/services/import-export/import-export.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FilePickerComponent } from '../../forms/file-picker/file-picker.component';
import { SettingsService } from 'src/app/shared/services/settings/settings.service';
import { ProductionChainService } from 'src/app/shared/services/production-chain/production-chain.service';
import { ProductionCatalogUiService } from 'src/app/shared/services/production-catalog/production-catalog-ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, NgOptimizedImage, FilePickerComponent, NgClass],
})
export class HeaderComponent {
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

  protected onImportProductionChains(files: File[]): void {
    const mode = this.settingsService.$importChainsMode();
    this.importExportService
      .uploadAllProductionChains(files, mode)
      .then(() => {
        this.productionChainService.reloadFromStorage();
      })
      .catch((error) => {
        console.log(error);
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
