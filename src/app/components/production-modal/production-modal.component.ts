import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from '../modal/modal.component';
import {
  Machine,
  MachineItem,
  newMachineItem,
  reCalcItemRate,
  reCalcProductionRates,
} from './production.model';

@Component({
  selector: 'app-production-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,

    // CDK
    DragDropModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  templateUrl: './production-modal.component.html',
})
export class ProductionModalComponent {
  public readonly reCalcProductionRates = reCalcProductionRates;
  public readonly reCalcItemRate = reCalcItemRate;

  @Input()
  public machine?: Machine;

  @Input()
  public show: boolean = false;
  @Output()
  public showChange: EventEmitter<boolean> = new EventEmitter();

  public onAddItem(itemList: MachineItem[]): void {
    itemList.push(newMachineItem());
  }

  public onDeleteItem(itemList: MachineItem[], index: number): void {
    if (index > -1) {
      itemList.splice(index, 1);
    }
  }

  public drop(event: CdkDragDrop<Machine[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
