import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContentLayoutComponent, SelectionListComponent],
})
export class SettingsViewComponent {
  private readonly settingsService = inject(SettingsService);

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
  protected readonly editorDisplayOptions: readonly SelectionListOption[] = [
    {
      id: 'modal',
      display: 'Modal Popup',
      description: 'Keep focus in a dialog overlay.',
    },
    {
      id: 'sidebar',
      display: 'Right Sidebar',
      description: 'Slide out editor beside the list.',
    },
    {
      id: 'full',
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

  protected setEditorDisplayMode(mode: string | undefined): void {
    if (!mode) {
      return;
    }
    if (!isEditorDisplayMode(mode)) {
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

  protected onResetSettings(): void {
    this.settingsService.resetSettings();
  }
}

function isEditorDisplayMode(value: string): value is EditorDisplayMode {
  return value === 'modal' || value === 'sidebar' || value === 'full';
}
