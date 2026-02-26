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
import { TooltipDirective } from 'src/app/components/generic/tooltip/tooltip.directive';
import { RateUnitValueComponent } from 'src/app/components/generic/rate-unit-value/rate-unit-value.component';
import { ProductionCatalogService } from 'src/app/shared/services/production-catalog/production-catalog.service';
import { reCalcProductionRates } from '../../production-editor/production.util';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';
import { ProductionMovePreviewMode } from 'src/app/shared/services/production/production-tree-dnd.util';
import { BadgeComponent } from 'src/app/components/generic/badge/badge.component';
import { BadgeTone } from 'src/app/components/generic/badge/badge-tone.enum';
import { BadgeSize } from 'src/app/components/generic/badge/badge-size.enum';
import { CompositeIconComponent } from 'src/app/components/generic/composite-icon/composite-icon.component';
import { MenuComponent, MenuItem } from 'src/app/components/generic/menu/menu.component';
import { MenuAction } from 'src/app/components/generic/menu/menu-action.enum';
import { MENU_ITEMS_DUPLICATE_DOWNLOAD_DELETE } from 'src/app/components/generic/menu/menu-items.constants';

@Component({
  selector: 'app-production-item',
  templateUrl: './production-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TooltipDirective,
    RateUnitValueComponent,
    BadgeComponent,
    CompositeIconComponent,
    MenuComponent,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class ProductionItemComponent {
  protected readonly ProductionMovePreviewMode = ProductionMovePreviewMode;
  protected readonly BadgeTone = BadgeTone;
  protected readonly BadgeSize = BadgeSize;
  protected readonly MenuAction = MenuAction;
  protected readonly $actionMenuItems: readonly MenuItem[] =
    MENU_ITEMS_DUPLICATE_DOWNLOAD_DELETE;

  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly $machine = input.required<Production>();
  public readonly $depth = input<number>(0);
  public readonly $hasChildren = input<boolean>(false);
  public readonly $childCount = input<number>(0);
  public readonly $dragSubtreeCount = input<number>(0);
  public readonly $isDropBefore = input<boolean>(false);
  public readonly $isDropContainer = input<boolean>(false);
  public readonly $dropContainerMode =
    input<ProductionMovePreviewMode | undefined>(undefined);
  public readonly $isDragging = input<boolean>(false);
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  public readonly $recipeIconsByName =
    this.productionCatalogService.$recipeIconsByName;
  public readonly $machineIconsByName =
    this.productionCatalogService.$machineIconsByName;

  public readonly $editMachine = output<Production>();
  public readonly $duplicateMachine = output<Production>();
  public readonly $deleteMachine = output<string>();
  public readonly $downloadMachine = output<Production>();
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

  protected onDownloadMachine(machine: Production): void {
    this.$downloadMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }

  protected onActionSelected(actionId: string): void {
    const machine = this.$machine();
    if (actionId === MenuAction.Duplicate) {
      this.onDuplicateMachine(machine);
      return;
    }
    if (actionId === MenuAction.Download) {
      this.onDownloadMachine(machine);
      return;
    }
    if (actionId === MenuAction.Delete) {
      this.onDeleteMachine(machine);
    }
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
