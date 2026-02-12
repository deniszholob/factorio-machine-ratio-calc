import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DecimalPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { Production } from '../production-editor/production.model';
import { ProductionTotals } from 'src/app/shared/production/production.service';
import { ProductionItemComponent } from './production-item/production-item.component';
import { ProductionCatalogService } from 'src/app/shared/production-catalog/production-catalog.service';

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

  public readonly $editMachine = output<Production>();
  public readonly $duplicateMachine = output<Production>();
  public readonly $deleteMachine = output<number>();
  public readonly $updateMachineCount = output<Production>();
  public readonly $drop = output<CdkDragDrop<Production[]>>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
  }

  protected onDuplicateMachine(machine: Production): void {
    this.$duplicateMachine.emit(machine);
  }

  protected onDeleteMachine(index: number): void {
    this.$deleteMachine.emit(index);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
  }

  protected onDrop(event: CdkDragDrop<Production[]>): void {
    this.$drop.emit(event);
  }
}
