import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Production,
  reCalcProductionRates,
} from '../production-modal/production.model';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-production-entry',
  templateUrl: './production-entry.component.html',
  host: { class: 'contents' },
  imports: [CommonModule, FormsModule, CdkDragHandle, CdkDrag],
})
export class ProductionEntryComponent {
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
