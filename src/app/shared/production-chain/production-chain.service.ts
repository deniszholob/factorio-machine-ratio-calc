import { Injectable, computed, signal } from '@angular/core';

export interface ProductionTab {
  readonly id: number;
  readonly name: string;
}

@Injectable({ providedIn: 'root' })
export class ProductionChainService {
  public readonly $productions = signal<ProductionTab[]>([
    { id: 1, name: 'Starter Smelter' },
    { id: 2, name: 'Green Circuits' },
  ]);

  public readonly $activeProductionId = signal<number>(1);
  public readonly $editingProductionId = signal<number | null>(null);
  public readonly $editingName = signal<string>('');

  private readonly $nextProductionId = signal<number>(3);

  public readonly $activeProductionName = computed(() => {
    const activeId = this.$activeProductionId();
    const activeProduction = this.$productions().find(
      (production) => production.id === activeId,
    );
    return activeProduction?.name ?? 'Production';
  });

  public readonly $hasProductions = computed(
    () => this.$productions().length > 0,
  );

  public addProduction(): void {
    const nextId = this.$nextProductionId();
    this.$nextProductionId.update((id) => id + 1);

    const newProduction: ProductionTab = {
      id: nextId,
      name: 'New Production',
    };

    this.$productions.update((items) => [...items, newProduction]);
    this.$activeProductionId.set(nextId);
    this.$editingProductionId.set(nextId);
    this.$editingName.set(newProduction.name);
  }

  public selectProduction(productionId: number): void {
    this.$activeProductionId.set(productionId);
  }

  public startRename(productionId: number): void {
    const production = this.$productions().find(
      (item) => item.id === productionId,
    );

    if (!production) {
      return;
    }

    this.$activeProductionId.set(productionId);
    this.$editingProductionId.set(productionId);
    this.$editingName.set(production.name);
  }

  public cancelRename(): void {
    this.$editingProductionId.set(null);
  }

  public commitRename(): void {
    const editingId = this.$editingProductionId();
    if (editingId === null) {
      return;
    }

    const nextName = this.$editingName().trim();
    if (!nextName) {
      this.cancelRename();
      return;
    }

    this.$productions.update((items) =>
      items.map((item) =>
        item.id === editingId ? { ...item, name: nextName } : item,
      ),
    );

    this.$editingProductionId.set(null);
  }

  public updateEditingName(value: string): void {
    this.$editingName.set(value);
  }

  public deleteProduction(productionId: number): void {
    const nextItems = this.$productions().filter(
      (item) => item.id !== productionId,
    );

    this.$productions.set(nextItems);

    if (this.$activeProductionId() === productionId) {
      this.$activeProductionId.set(nextItems[0]?.id ?? 0);
    }

    if (this.$editingProductionId() === productionId) {
      this.$editingProductionId.set(null);
    }
  }
}
