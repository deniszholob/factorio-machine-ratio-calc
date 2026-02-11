import { Injectable, effect, signal } from '@angular/core';

import { LOCAL_STORAGE_KEY_SETTINGS } from '../local-storage/local-storage.data';

export type EditorDisplayMode = 'modal' | 'sidebar' | 'full';
export type ImportMode = 'add' | 'override';

interface SettingsState {
  editorDisplayMode: EditorDisplayMode;
  importChainsMode: ImportMode;
  importProductionsMode: ImportMode;
}

const DEFAULT_SETTINGS: SettingsState = {
  editorDisplayMode: 'modal',
  importChainsMode: 'add',
  importProductionsMode: 'add',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  public readonly defaultSettings: Readonly<SettingsState> = DEFAULT_SETTINGS;

  public readonly $editorDisplayMode = signal<EditorDisplayMode>(
    DEFAULT_SETTINGS.editorDisplayMode,
  );
  public readonly $importChainsMode = signal<ImportMode>(
    DEFAULT_SETTINGS.importChainsMode,
  );
  public readonly $importProductionsMode = signal<ImportMode>(
    DEFAULT_SETTINGS.importProductionsMode,
  );
  public readonly $isSettingsOpen = signal<boolean>(false);

  public constructor() {
    const stored = this.loadSettings();
    this.$editorDisplayMode.set(stored.editorDisplayMode);
    this.$importChainsMode.set(stored.importChainsMode);
    this.$importProductionsMode.set(stored.importProductionsMode);

    effect(() => {
      const payload: SettingsState = {
        editorDisplayMode: this.$editorDisplayMode(),
        importChainsMode: this.$importChainsMode(),
        importProductionsMode: this.$importProductionsMode(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(payload));
    });
  }

  public setEditorDisplayMode(mode: EditorDisplayMode): void {
    this.$editorDisplayMode.set(mode);
  }

  public setImportChainsMode(mode: ImportMode): void {
    this.$importChainsMode.set(mode);
  }

  public setImportProductionsMode(mode: ImportMode): void {
    this.$importProductionsMode.set(mode);
  }

  public openSettings(): void {
    this.$isSettingsOpen.set(true);
  }

  public closeSettings(): void {
    this.$isSettingsOpen.set(false);
  }

  public toggleSettings(): void {
    this.$isSettingsOpen.update((isOpen) => !isOpen);
  }

  public resetSettings(): void {
    this.$editorDisplayMode.set(DEFAULT_SETTINGS.editorDisplayMode);
    this.$importChainsMode.set(DEFAULT_SETTINGS.importChainsMode);
    this.$importProductionsMode.set(DEFAULT_SETTINGS.importProductionsMode);
  }

  private loadSettings(): SettingsState {
    const payload = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
    if (!payload) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(payload) as Partial<SettingsState>;
      return {
        editorDisplayMode:
          parsed.editorDisplayMode ?? DEFAULT_SETTINGS.editorDisplayMode,
        importChainsMode:
          parsed.importChainsMode ?? DEFAULT_SETTINGS.importChainsMode,
        importProductionsMode:
          parsed.importProductionsMode ?? DEFAULT_SETTINGS.importProductionsMode,
      };
    } catch (error) {
      console.warn('Unable to read settings from storage', error);
      return DEFAULT_SETTINGS;
    }
  }
}
