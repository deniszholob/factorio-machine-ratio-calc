import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { ProductionService } from '../production/production.service';
import {
  Production,
  normalizeProduction,
  syncAutoProductionName,
} from '../../components/production-chain-editor/production-editor/production.model';
import { guid } from 'src/app/shared/guid/guid.util';
import { ProductionChain } from 'src/app/components/production-chain-group/production-chain-item/production-chain.model';
import {
  decodeProductionChainHash,
  encodeProductionChainHash,
} from './production-chain-hash.util';

@Injectable({ providedIn: 'root' })
export class ProductionChainService {
  private readonly importExportService = inject(ImportExportService);
  private readonly productionService = inject(ProductionService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private isHydratingFromHash = false;

  public readonly $productionChains = signal<ProductionChain[]>([]);
  public readonly $activeProductionChainId = signal<string | undefined>(
    undefined,
  );
  public readonly $editingProductionChainId = signal<string | undefined>(
    undefined,
  );
  public readonly $editingProductionChainDisplay = signal<string>('');
  public readonly $editingProductionChainIconUrl = signal<string>('');

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

  public readonly $activeChainProductions = computed<Production[]>(() => {
    const activeId = this.$activeProductionChainId();
    if (!activeId) {
      return [];
    }
    const activeChain = this.$productionChains().find(
      (chain) => chain.id === activeId,
    );
    if (!activeChain || !Array.isArray(activeChain.productions)) {
      return [];
    }
    return activeChain.productions;
  });

  /** On service init, load any stored production chains from localstorage */
  public constructor() {
    if (this.isBrowser) {
      this.importProductionChainFromHash(this.document.location.hash);
      this.document.defaultView?.addEventListener(
        'hashchange',
        this.onHashChange,
      );
    }

    // TODO: use storedChains are initial signal value
    // TODO: make activeProductionChainId a linked signal with storedChains[0]?.id as initial value
    effect(() => {
      const storedChains = normalizeProductionChains(
        this.importExportService.loadAllProductionChains(),
      );
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

    effect(() => {
      if (!this.isBrowser || this.isHydratingFromHash) {
        return;
      }

      const activeId = this.$activeProductionChainId();
      if (!activeId) {
        this.replaceHash('');
        return;
      }

      const activeChain = this.$productionChains().find(
        (chain) => chain.id === activeId,
      );
      if (!activeChain) {
        return;
      }

      this.replaceHash(encodeProductionChainHash(activeChain));
    });
  }

  public addProduction(): void {
    const id: string = guid();
    const newProduction: ProductionChain = {
      id,
      display: 'New Production Chain',
      iconUrl: undefined,
      productions: [],
    };

    this.$productionChains.update((items) => [...items, newProduction]);
    this.$activeProductionChainId.set(id);
    this.$editingProductionChainId.set(id);
    this.$editingProductionChainDisplay.set(newProduction.display);
    this.$editingProductionChainIconUrl.set('');
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
    this.$editingProductionChainIconUrl.set(production.iconUrl ?? '');
  }

  public cancelRename(): void {
    this.$editingProductionChainId.set(undefined);
    this.$editingProductionChainIconUrl.set('');
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
        item.id === editingId
          ? {
              ...item,
              display: nextName,
              iconUrl: normalizeIconUrl(this.$editingProductionChainIconUrl()),
            }
          : item,
      ),
    );

    this.$editingProductionChainId.set(undefined);
    this.$editingProductionChainIconUrl.set('');
    this.persist();
  }

  public updateEditingName(value: string): void {
    this.$editingProductionChainDisplay.set(value);
  }

  public updateEditingIconUrl(value: string): void {
    this.$editingProductionChainIconUrl.set(value);
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

  public duplicateProductionChain(productionId: string): void {
    const chain = this.$productionChains().find(
      (item) => item.id === productionId,
    );
    if (!chain) {
      return;
    }

    const nextDisplay = `${chain.display} Copy`;
    const duplicated: ProductionChain = {
      id: guid(),
      display: nextDisplay,
      iconUrl: chain.iconUrl,
      productions: duplicateChainProductions(chain.productions),
    };

    this.$productionChains.update((items) => [...items, duplicated]);
    this.$activeProductionChainId.set(duplicated.id);
    this.persist();
  }

  public resetAllProductionChains(): void {
    this.$productionChains.set([]);
    this.$activeProductionChainId.set(undefined);
    this.$editingProductionChainId.set(undefined);
    this.$editingProductionChainDisplay.set('');
    this.$editingProductionChainIconUrl.set('');
    this.productionService.clearMachines();
    this.importExportService.clearAllProductionChains();
  }

  public setActiveChainProductions(machines: Production[]): void {
    const activeId = this.$activeProductionChainId();
    if (!activeId) {
      return;
    }

    const clonedMachines = cloneProductions(machines);

    const activeChain = this.$productionChains().find(
      (chain) => chain.id === activeId,
    );
    if (
      activeChain &&
      serializeProductions(activeChain.productions) ===
        serializeProductions(clonedMachines)
    ) {
      return;
    }

    this.$productionChains.update((items) =>
      items.map((item) =>
        item.id === activeId ? { ...item, productions: clonedMachines } : item,
      ),
    );
    this.persist();
  }

  public renameCatalogReferences(
    previousName: string,
    nextName: string,
    isMachine: boolean,
  ): void {
    const from = previousName.trim();
    const to = nextName.trim();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) {
      return;
    }

    let hasChanges = false;
    this.$productionChains.update((chains) =>
      chains.map((chain) => {
        const nextProductions = chain.productions.map((production) => {
          let changed = false;
          const nextRecipeInputs = production.recipe.inputs.map((item) => {
            if (item.name.trim().toLowerCase() !== from.toLowerCase()) {
              return item;
            }
            changed = true;
            return { ...item, name: to };
          });
          const nextRecipeOutputs = production.recipe.outputs.map((item) => {
            if (item.name.trim().toLowerCase() !== from.toLowerCase()) {
              return item;
            }
            changed = true;
            return { ...item, name: to };
          });

          let nextMachineName = production.machine.name;
          if (
            isMachine &&
            production.machine.name.trim().toLowerCase() === from.toLowerCase()
          ) {
            changed = true;
            nextMachineName = to;
          }

          if (!changed) {
            return production;
          }

          hasChanges = true;
          const nextProduction: Production = {
            ...production,
            recipe: {
              ...production.recipe,
              inputs: nextRecipeInputs,
              outputs: nextRecipeOutputs,
            },
            machine: {
              ...production.machine,
              name: nextMachineName,
            },
          };
          syncAutoProductionName(nextProduction);
          return nextProduction;
        });

        if (!hasChanges) {
          return chain;
        }

        return {
          ...chain,
          productions: nextProductions,
        };
      }),
    );

    if (hasChanges) {
      this.persist();
    }
  }

  public reloadFromStorage(): void {
    const storedChains = normalizeProductionChains(
      this.importExportService.loadAllProductionChains(),
    );
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

  private readonly onHashChange = (): void => {
    if (!this.isBrowser || this.isHydratingFromHash) {
      return;
    }
    this.importProductionChainFromHash(this.document.location.hash);
  };

  private importProductionChainFromHash(hash: string): void {
    const sharedChain = decodeProductionChainHash(hash);
    if (!sharedChain) {
      return;
    }

    if (this.$productionChains().length === 0) {
      const storedChains = normalizeProductionChains(
        this.importExportService.loadAllProductionChains(),
      );
      if (storedChains.length > 0) {
        this.$productionChains.set(storedChains);
      }
    }

    const importedChain: ProductionChain = {
      id: guid(),
      display: ensureSharedDisplayName(
        sharedChain.display,
        this.$productionChains().map((chain) => chain.display),
      ),
      iconUrl: sharedChain.iconUrl,
      productions: sharedChain.productions,
    };

    this.isHydratingFromHash = true;
    this.$productionChains.update((chains) => [...chains, importedChain]);
    this.$activeProductionChainId.set(importedChain.id);
    this.$editingProductionChainId.set(undefined);
    this.$editingProductionChainDisplay.set('');
    this.$editingProductionChainIconUrl.set('');
    this.persist();
    this.isHydratingFromHash = false;
  }

  private replaceHash(hash: string): void {
    const view = this.document.defaultView;
    if (!view) {
      return;
    }

    const currentHash = view.location.hash;
    if (currentHash === hash) {
      return;
    }

    const nextUrl = `${view.location.pathname}${view.location.search}${hash}`;
    view.history.replaceState(null, '', nextUrl);
  }
}

function serializeProductions(productions: Production[]): string {
  return JSON.stringify(productions);
}

function cloneProductions(productions: Production[]): Production[] {
  if (typeof structuredClone === 'function') {
    return structuredClone(productions);
  }
  return JSON.parse(JSON.stringify(productions)) as Production[];
}

function duplicateChainProductions(productions: Production[]): Production[] {
  const idMap = new Map<string, string>();
  for (const production of productions) {
    idMap.set(production.id, guid());
  }

  return productions.map((production) => {
    const normalized = normalizeProduction(production);
    const nextId = idMap.get(production.id) ?? guid();
    const nextParentId = production.parentProductionId
      ? idMap.get(production.parentProductionId)
      : undefined;

    return {
      ...normalized,
      id: nextId,
      parentProductionId: nextParentId,
    };
  });
}

function normalizeProductionChains(
  chains: ProductionChain[],
): ProductionChain[] {
  return chains.map((chain) => ({
    ...chain,
    productions: Array.isArray(chain.productions)
      ? chain.productions.map((production) => normalizeProduction(production))
      : [],
  }));
}

function normalizeIconUrl(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function ensureSharedDisplayName(
  baseName: string,
  existingNames: string[],
): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 1;
  let nextName = `${baseName} (shared)`;
  while (existingNames.includes(nextName)) {
    counter += 1;
    nextName = `${baseName} (shared ${counter})`;
  }
  return nextName;
}
