import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import {
  Production,
  reCalcProductionRates,
} from '../../production-editor/production.model';

@Component({
  selector: 'app-production-item',
  templateUrl: './production-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CdkDragHandle, CdkDrag],
})
export class ProductionItemComponent {
  public readonly $machine = input.required<Production>();

  public readonly $editMachine = output<Production>();
  public readonly $deleteMachine = output<Production>();
  public readonly $updateMachineCount = output<Production>();

  protected onEditMachine(machine: Production): void {
    this.$editMachine.emit(machine);
  }

  protected onDeleteMachine(machine: Production): void {
    this.$deleteMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Production): void {
    this.$updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }
}
