import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Machine,
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
  public readonly $machine = input.required<Machine>();

  public readonly $editMachine = output<Machine>();
  public readonly $deleteMachine = output<Machine>();
  public readonly $updateMachineCount = output<Machine>();

  protected onEditMachine(machine: Machine): void {
    this.$editMachine.emit(machine);
  }

  protected onDeleteMachine(machine: Machine): void {
    this.$deleteMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Machine): void {
    this.$updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }
}
