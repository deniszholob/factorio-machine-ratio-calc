import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FilePickerComponent } from '../file-picker/file-picker.component';
import { SettingsService } from 'src/app/shared/settings/settings.service';
import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';

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
  protected readonly $isSettingsOpen = this.settingsService.$isSettingsOpen;

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
    this.settingsService.toggleSettings();
  }
}
