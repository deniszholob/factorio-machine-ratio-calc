import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, NgOptimizedImage],
})
export class HeaderComponent {
  private readonly importExportService: ImportExportService =
    inject(ImportExportService);

  protected onImportProduction(): void {
    this.importExportService.importProduction();
  }

  protected onExportProduction(): void {
    this.importExportService.exportProduction();
  }
}
