import {
  CdkDragDrop,
  CdkDragSortEvent,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { DecimalPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { Production } from '../production-editor/production.model';
import { ProductionTotals } from 'src/app/shared/production/production.service';
import { ProductionItemComponent } from './production-item/production-item.component';
import { ProductionCatalogService } from 'src/app/shared/production-catalog/production-catalog.service';
import {
  ProductionMoveEvent,
  ProductionMovePreview,
  ProductionTreeRow,
  buildDragPreview,
  buildVisibleRows,
  collectSubtreeIds,
} from 'src/app/shared/production/production-tree-dnd.util';

@Component({
  selector: 'app-production-group',
  templateUrl: './production-group.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, DecimalPipe, ProductionItemComponent, DragDropModule],
})
export class ProductionGroupComponent {
  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly $machines = input.required<Production[]>();
  public readonly $machineTotals = input.required<ProductionTotals>();
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  protected readonly $visibleRows = computed<ProductionTreeRow[]>(() =>
    buildVisibleRows(this.$machines()),
  );
  protected readonly $draggedMachineId = signal<string | undefined>(undefined);
  protected readonly $dragDistanceX = signal<number>(0);
  protected readonly $dragCurrentIndex = signal<number | undefined>(undefined);
  /**
   * Full subtree ids (dragged node + descendants) for the active drag.
   * Used to compute preview and hide descendants during drag for clearer UX.
   */
  protected readonly $draggedSubtreeIds = computed<Set<string>>(() => {
    const draggedMachineId = this.$draggedMachineId();
    if (!draggedMachineId) {
      return new Set<string>();
    }
    return collectSubtreeIds(this.$machines(), draggedMachineId);
  });
  /** Descendant-only subset of the dragged subtree (excludes dragged node). */
  protected readonly $draggedDescendantIds = computed<Set<string>>(() => {
    const draggedMachineId = this.$draggedMachineId();
    const subtreeIds = this.$draggedSubtreeIds();
    if (!draggedMachineId || subtreeIds.size === 0) {
      return new Set<string>();
    }

    const descendants = new Set<string>(subtreeIds);
    descendants.delete(draggedMachineId);
    return descendants;
  });
  /**
   * Rows rendered in the list while dragging.
   * Descendants of the dragged row are temporarily hidden so the parent
   * visually behaves like a grouped subtree during drag.
   */
  protected readonly $renderRows = computed<ProductionTreeRow[]>(() => {
    const descendantIds = this.$draggedDescendantIds();
    if (descendantIds.size === 0) {
      return this.$visibleRows();
    }
    return this.$visibleRows().filter(
      (row) => !descendantIds.has(row.production.id),
    );
  });
  /** Map used to show "moving N child rows" only on the dragged parent row. */
  protected readonly $dragSubtreeCountById = computed<
    Partial<Record<string, number>>
  >(() => {
    const draggedMachineId = this.$draggedMachineId();
    if (!draggedMachineId) {
      return {};
    }
    const descendantCount = this.$draggedDescendantIds().size;
    if (descendantCount <= 0) {
      return {};
    }
    return { [draggedMachineId]: descendantCount };
  });
  /**
   * Derived drop intent from current drag position (index + horizontal offset).
   * This is used for visual hints; final drop recalculates deterministically.
   */
  protected readonly $dragPreview = computed<ProductionMovePreview | undefined>(
    () =>
      buildDragPreview(
        this.$renderRows(),
        this.$machines(),
        this.$draggedMachineId(),
        this.$dragCurrentIndex(),
        this.$dragDistanceX(),
      ),
  );
  protected readonly $dropHint = computed<string | undefined>(() => {
    const preview = this.$dragPreview();
    if (!preview) {
      return undefined;
    }
    if (preview.mode === 'into-parent') {
      return 'Drop mode: into parent';
    }
    if (preview.mode === 'outside-parent') {
      return 'Drop mode: outside parent';
    }
    return 'Drop mode: reorder within level';
  });
  protected readonly $dropBeforeById = computed<Record<string, boolean>>(() => {
    const preview = this.$dragPreview();
    if (!preview?.beforeMachineId) {
      return {};
    }
    return { [preview.beforeMachineId]: true };
  });
  protected readonly $dropParentById = computed<Record<string, boolean>>(() => {
    const preview = this.$dragPreview();
    if (preview?.mode !== 'into-parent' || !preview.parentProductionId) {
      return {};
    }
    return { [preview.parentProductionId]: true };
  });

  public readonly $editMachine = output<Production>();
  public readonly $duplicateMachine = output<Production>();
  public readonly $deleteMachine = output<string>();
  public readonly $updateMachineCount = output<Production>();
  public readonly $toggleMachineExpanded = output<string>();
  public readonly $addChildMachine = output<string>();
  public readonly $moveMachine = output<ProductionMoveEvent>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
  }

  protected onDuplicateMachine(machine: Production): void {
    this.$duplicateMachine.emit(machine);
  }

  protected onDeleteMachine(machineId: string): void {
    this.$deleteMachine.emit(machineId);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
  }

  protected onToggleMachineExpanded(machineId: string): void {
    this.$toggleMachineExpanded.emit(machineId);
  }

  protected onAddChildMachine(machineId: string): void {
    this.$addChildMachine.emit(machineId);
  }

  /**
   * Finalizes a drop by recomputing target placement from drop event payload,
   * instead of relying on transient preview state.
   */
  protected onDrop(
    event: CdkDragDrop<ProductionTreeRow[], ProductionTreeRow[], string>,
  ): void {
    const preview = buildDragPreview(
      this.$renderRows(),
      this.$machines(),
      event.item.data,
      event.currentIndex,
      event.distance.x,
    );
    if (!preview) {
      this.clearDragState();
      return;
    }
    this.$moveMachine.emit(preview);
    this.clearDragState();
  }

  protected onDragStarted(machineId: string): void {
    this.$draggedMachineId.set(machineId);
    this.$dragDistanceX.set(0);
    this.$dragCurrentIndex.set(undefined);
  }

  protected onDragMoved(event: { machineId: string; distanceX: number }): void {
    if (this.$draggedMachineId() !== event.machineId) {
      return;
    }
    this.$dragDistanceX.set(event.distanceX);
  }

  protected onDragSorted(event: CdkDragSortEvent<ProductionTreeRow[]>): void {
    this.$dragCurrentIndex.set(event.currentIndex);
  }

  protected onDragEnded(): void {
    this.clearDragState();
  }

  private clearDragState(): void {
    this.$draggedMachineId.set(undefined);
    this.$dragDistanceX.set(0);
    this.$dragCurrentIndex.set(undefined);
  }
}
