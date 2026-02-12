import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductionCatalogUiService {
  public readonly $isCatalogOpen = signal<boolean>(false);

  public openCatalog(): void {
    this.$isCatalogOpen.set(true);
  }

  public closeCatalog(): void {
    this.$isCatalogOpen.set(false);
  }

  public setCatalogOpen(isOpen: boolean): void {
    this.$isCatalogOpen.set(isOpen);
  }

  public toggleCatalog(): void {
    this.$isCatalogOpen.update((isOpen) => !isOpen);
  }
}
