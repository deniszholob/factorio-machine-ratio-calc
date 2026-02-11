import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FilePickerComponent } from '../file-picker/file-picker.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, NgOptimizedImage, FilePickerComponent],
})
export class HeaderComponent {
  private readonly importExportService: ImportExportService =
    inject(ImportExportService);

  protected onImportProductionChains(files: File[]): void {
    this.importExportService.uploadAllProductionChains(files);
  }

  protected onExportProductionChains(): void {
    this.importExportService.downloadAllProductionChains();
  }
}
