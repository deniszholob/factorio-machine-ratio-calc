import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Machine,
  reCalcProductionRates,
} from '../production-modal/production.model';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-production-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDragHandle, CdkDrag],
  templateUrl: './production-entry.component.html',
})
export class ProductionEntryComponent {
  @Input()
  public machine?: Machine;

  @Output()
  public editMachine: EventEmitter<Machine> = new EventEmitter();
  @Output()
  public deleteMachine: EventEmitter<Machine> = new EventEmitter();
  @Output()
  public updateMachineCount: EventEmitter<Machine> = new EventEmitter();

  public onEditMachine(machine: Machine): void {
    this.editMachine.emit(machine);
  }

  public onDeleteMachine(machine: Machine): void {
    this.deleteMachine.emit(machine);
  }

  protected onUpdateMachineCount(machine: Machine): void {
    this.updateMachineCount.emit(machine);
    reCalcProductionRates(machine);
  }
}
