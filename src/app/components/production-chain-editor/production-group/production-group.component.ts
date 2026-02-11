import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { Production } from '../production-editor/production.model';
import { ProductionTotals } from 'src/app/shared/production/production.service';
import { ProductionItemComponent } from './production-item/production-item.component';

@Component({
  selector: 'app-production-group',
  templateUrl: './production-group.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProductionItemComponent, DragDropModule],
})
export class ProductionGroupComponent {
  public readonly $machines = input.required<Production[]>();
  public readonly $machineTotals = input.required<ProductionTotals>();

  public readonly $editMachine = output<Production>();
  public readonly $deleteMachine = output<number>();
  public readonly $updateMachineCount = output<Production>();
  public readonly $drop = output<CdkDragDrop<Production[]>>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
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
