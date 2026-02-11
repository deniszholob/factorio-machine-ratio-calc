import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from '../modal/modal.component';
import {
  Production,
  MachineItem,
  newMachineItem,
  reCalcItemRate,
  reCalcProductionRates,
} from './production.model';

@Component({
  selector: 'app-production-modal',
  templateUrl: './production-modal.component.html',
  host: { class: 'contents' },
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    // CDK
    DragDropModule,
    CdkDropList,
    CdkDrag,
  ],
})
export class ProductionModalComponent {
  public readonly reCalcProductionRates = reCalcProductionRates;
  public readonly reCalcItemRate = reCalcItemRate;

  public readonly $machine = input.required<Production | undefined>();
  public readonly $show = model<boolean>(false);

  protected onAddItem(itemList: MachineItem[]): void {
    itemList.push(newMachineItem());
  }

  protected onDeleteItem(itemList: MachineItem[], index: number): void {
    if (index > -1) {
      itemList.splice(index, 1);
    }
  }

  protected drop(event: CdkDragDrop<Production[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
