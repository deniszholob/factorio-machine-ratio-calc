import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
  CdkDragMove,
  CdkDragStart,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from 'src/app/components/tooltip/tooltip.directive';
import { ProductionCatalogService } from 'src/app/shared/production-catalog/production-catalog.service';
import {
  Production,
  reCalcProductionRates,
} from '../../production-editor/production.model';

@Component({
  selector: 'app-production-item',
  templateUrl: './production-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TooltipDirective,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class ProductionItemComponent {
  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly $machine = input.required<Production>();
  public readonly $depth = input<number>(0);
  public readonly $hasChildren = input<boolean>(false);
  public readonly $childCount = input<number>(0);
  public readonly $dragSubtreeCount = input<number>(0);
  public readonly $isDropBefore = input<boolean>(false);
  public readonly $isDropParent = input<boolean>(false);
  public readonly $isDragging = input<boolean>(false);
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  public readonly $machineIconsByName =
    this.productionCatalogService.$machineIconsByName;

  public readonly $editMachine = output<Production>();
  public readonly $duplicateMachine = output<Production>();
  public readonly $deleteMachine = output<string>();
  public readonly $updateMachineCount = output<Production>();
  public readonly $toggleExpanded = output<string>();
  public readonly $addChild = output<string>();
  public readonly $dragStarted = output<string>();
  public readonly $dragEnded = output<void>();
  public readonly $dragMoved = output<{
    machineId: string;
    distanceX: number;
  }>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
  }

  protected onDeleteMachine(machine: Production): void {
    this.$deleteMachine.emit(machine.id);
  }

  protected onDuplicateMachine(machine: Production): void {
    this.$duplicateMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }

  protected onToggleExpanded(machineId: string): void {
    this.$toggleExpanded.emit(machineId);
  }

  protected onAddChild(machineId: string): void {
    this.$addChild.emit(machineId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDragStarted(machineId: string, _event: CdkDragStart): void {
    this.$dragStarted.emit(machineId);
  }

  protected onDragMoved(machineId: string, event: CdkDragMove): void {
    this.$dragMoved.emit({ machineId, distanceX: event.distance.x });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDragEnded(_event: CdkDragEnd): void {
    this.$dragEnded.emit();
  }
}
