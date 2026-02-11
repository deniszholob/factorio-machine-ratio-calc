import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { ProductionService } from '../production/production.service';
import { Production } from '../../components/production-chain-editor/production-editor/production.model';
import { guid } from 'src/app/shared/guid/guid.util';
import { ProductionChain } from 'src/app/components/production-chain-group/production-chain-item/production-chain.model';

@Injectable({ providedIn: 'root' })
export class ProductionChainService {
  private readonly importExportService = inject(ImportExportService);
  private readonly productionService = inject(ProductionService);

  public readonly $productionChains = signal<ProductionChain[]>([]);
  public readonly $activeProductionChainId = signal<string | undefined>(
    undefined,
  );
  public readonly $editingProductionChainId = signal<string | undefined>(
    undefined,
  );
  public readonly $editingProductionChainDisplay = signal<string>('');

  public readonly $activeProductionName = computed(() => {
    const activeId = this.$activeProductionChainId();
    const activeProduction = this.$productionChains().find(
      (production) => production.id === activeId,
    );
    return activeProduction?.display ?? 'Production';
  });

  public readonly $hasProductionChains = computed(
    () => this.$productionChains().length > 0,
  );

  /** On service init, load any stored production chains from localstorage */
  public constructor() {
    // TODO: use storedChains are initial signal value
    // TODO: make activeProductionChainId a linked signal with storedChains[0]?.id as initial value
    effect(() => {
      const storedChains: ProductionChain[] =
        this.importExportService.loadAllProductionChains();
      if (storedChains.length === 0 || this.$productionChains().length > 0) {
        return;
      }

      this.$productionChains.set(storedChains);
      this.$activeProductionChainId.set(storedChains[0]?.id);
    });

    // TODO: Inspect further if this can be converted to an effect and removed
    effect(() => {
      const activeId = this.$activeProductionChainId();
      if (!activeId) {
        return;
      }

      const activeChain = this.$productionChains().find(
        (chain) => chain.id === activeId,
      );
      if (!activeChain) {
        return;
      }

      const activeProductions = Array.isArray(activeChain.productions)
        ? activeChain.productions
        : [];

      if (!Array.isArray(activeChain.productions)) {
        this.$productionChains.update((items) =>
          items.map((item) =>
            item.id === activeId ? { ...item, productions: [] } : item,
          ),
        );
      }

      this.productionService.setMachines(activeProductions);
    });
  }

  public addProduction(): void {
    const id: string = guid();
    const newProduction: ProductionChain = {
      id,
      display: 'New Production Chain',
      productions: [],
    };

    this.$productionChains.update((items) => [...items, newProduction]);
    this.$activeProductionChainId.set(id);
    this.$editingProductionChainId.set(id);
    this.$editingProductionChainDisplay.set(newProduction.display);
    this.persist();
  }

  public selectProduction(productionId: string): void {
    this.$activeProductionChainId.set(productionId);
    this.persist();
  }

  public startRename(productionId: string): void {
    const production = this.$productionChains().find(
      (item) => item.id === productionId,
    );

    if (!production) {
      return;
    }

    this.$activeProductionChainId.set(productionId);
    this.$editingProductionChainId.set(productionId);
    this.$editingProductionChainDisplay.set(production.display);
  }

  public cancelRename(): void {
    this.$editingProductionChainId.set(undefined);
  }

  public commitRename(): void {
    const editingId = this.$editingProductionChainId();
    if (!editingId) {
      return;
    }

    const nextName = this.$editingProductionChainDisplay().trim();
    if (!nextName) {
      this.cancelRename();
      return;
    }

    this.$productionChains.update((items) =>
      items.map((item) =>
        item.id === editingId ? { ...item, display: nextName } : item,
      ),
    );

    this.$editingProductionChainId.set(undefined);
    this.persist();
  }

  public updateEditingName(value: string): void {
    this.$editingProductionChainDisplay.set(value);
  }

  public deleteProduction(productionId: string): void {
    const nextItems = this.$productionChains().filter(
      (item) => item.id !== productionId,
    );

    this.$productionChains.set(nextItems);

    if (this.$activeProductionChainId() === productionId) {
      this.$activeProductionChainId.set(nextItems[0]?.id);
    }

    if (this.$editingProductionChainId() === productionId) {
      this.$editingProductionChainId.set(undefined);
    }

    this.persist();
  }

  public resetAllProductionChains(): void {
    this.$productionChains.set([]);
    this.$activeProductionChainId.set(undefined);
    this.$editingProductionChainId.set(undefined);
    this.$editingProductionChainDisplay.set('');
    this.productionService.clearMachines();
    this.importExportService.clearAllProductionChains();
  }

  public setActiveChainProductions(machines: Production[]): void {
    const activeId = this.$activeProductionChainId();
    if (!activeId) {
      return;
    }

    this.$productionChains.update((items) =>
      items.map((item) =>
        item.id === activeId ? { ...item, productions: machines } : item,
      ),
    );
    this.persist();
  }

  public reloadFromStorage(): void {
    const storedChains = this.importExportService.loadAllProductionChains();
    this.$productionChains.set(storedChains);

    const activeId = this.$activeProductionChainId();
    const hasActive =
      !!activeId && storedChains.some((chain) => chain.id === activeId);

    if (!hasActive) {
      this.$activeProductionChainId.set(storedChains[0]?.id);
      if (storedChains.length === 0) {
        this.productionService.clearMachines();
      }
    }
  }

  public getActiveProductionChainId(): string | undefined {
    return this.$activeProductionChainId();
  }

  private persist(): void {
    this.importExportService.saveAllProductionChains(this.$productionChains());
  }
}
