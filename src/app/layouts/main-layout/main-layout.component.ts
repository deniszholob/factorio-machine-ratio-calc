import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ImportExportService } from 'src/app/shared/import-export/import-export.service';
import { ProductionService } from 'src/app/shared/production/production.service';
import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';

interface ProductionTab {
  readonly id: number;
  readonly name: string;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  host: { class: 'contents' },
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  protected readonly productionService = inject(ProductionService);
  protected readonly productionChainService = inject(ProductionChainService);
  protected readonly importExportService = inject(ImportExportService);

  public readonly $lastUpdate = input<number>(0);

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

  protected onAddProduction(): void {
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

  protected onSelectProduction(productionId: number): void {
    this.$activeProductionId.set(productionId);
  }

  protected onStartRename(productionId: number): void {
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

  protected onCancelRename(): void {
    this.$editingProductionId.set(null);
  }

  protected onCommitRename(): void {
    const editingId = this.$editingProductionId();
    if (editingId === null) {
      return;
    }

    const nextName = this.$editingName().trim();
    if (!nextName) {
      this.onCancelRename();
      return;
    }

    this.$productions.update((items) =>
      items.map((item) =>
        item.id === editingId ? { ...item, name: nextName } : item,
      ),
    );

    this.$editingProductionId.set(null);
  }

  protected onEditInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.$editingName.set(inputElement.value);
  }

  protected onDeleteProduction(productionId: number): void {
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
