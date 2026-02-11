import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  EditorDisplayMode,
  ImportMode,
  SettingsService,
} from 'src/app/shared/settings/settings.service';
import { ContentLayoutComponent } from 'src/app/layouts/content-layout/content-layout.component';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ContentLayoutComponent],
})
export class SettingsViewComponent {
  private readonly settingsService = inject(SettingsService);

  protected readonly $editorDisplayMode = this.settingsService.$editorDisplayMode;
  protected readonly $importChainsMode = this.settingsService.$importChainsMode;
  protected readonly $importProductionsMode =
    this.settingsService.$importProductionsMode;

  protected setEditorDisplayMode(mode: EditorDisplayMode): void {
    this.settingsService.setEditorDisplayMode(mode);
  }

  protected setImportChainsMode(mode: ImportMode): void {
    this.settingsService.setImportChainsMode(mode);
  }

  protected setImportProductionsMode(mode: ImportMode): void {
    this.settingsService.setImportProductionsMode(mode);
  }

  protected onClose(): void {
    this.settingsService.closeSettings();
  }

  protected onResetSettings(): void {
    this.settingsService.resetSettings();
  }
}
