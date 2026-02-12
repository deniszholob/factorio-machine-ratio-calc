import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import {
  Production,
  reCalcProductionRates,
} from '../../production-editor/production.model';
import { TooltipDirective } from 'src/app/components/tooltip/tooltip.directive';
import { ProductionCatalogService } from 'src/app/shared/production-catalog/production-catalog.service';

@Component({
  selector: 'app-production-item',
  templateUrl: './production-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CdkDragHandle,
    CdkDrag,
    TooltipDirective,
  ],
})
export class ProductionItemComponent {
  private readonly productionCatalogService = inject(ProductionCatalogService);

  public readonly $machine = input.required<Production>();
  public readonly $itemIconsByName =
    this.productionCatalogService.$itemIconsByName;
  public readonly $machineIconsByName =
    this.productionCatalogService.$machineIconsByName;

  public readonly $editMachine = output<Production>();
  public readonly $duplicateMachine = output<Production>();
  public readonly $deleteMachine = output<Production>();
  public readonly $updateMachineCount = output<Production>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
  }

  protected onDeleteMachine(machine: Production): void {
    this.$deleteMachine.emit(machine);
  }

  protected onDuplicateMachine(machine: Production): void {
    this.$duplicateMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }
}
