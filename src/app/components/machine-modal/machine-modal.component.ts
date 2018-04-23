// Angular
import { Component, OnInit, Input } from '@angular/core';

// Models
import { Machine, newMachine, MachineItem, newMachineItem } from 'app/models/machine.model';

@Component({
    selector: 'app-machine-modal',
    templateUrl: './machine-modal.component.html',
    // styleUrls: ['./machine-modal.component.scss'] //Enable as needed
})
export class MachineModalComponent implements OnInit {
    @Input()
    public machine: Machine = null;

    constructor() { }

    ngOnInit() { }

    public onAddItem(itemList: MachineItem[]) {
        itemList.push(newMachineItem());
    }

    public onDeleteItem(itemList: MachineItem[], index: number) {
        if (index > -1) {
            itemList.splice(index, 1);
        }
    }

    public machineStatChange() {
        this.machine.effectiveTime = this.machine.timeToComplete / this.machine.craftingSpeed;
        this.recalcItems(this.machine.machineInputs);
        this.recalcItems(this.machine.machineOutputs);
    }

    public recalcItems(itemList: MachineItem[]) {
        itemList.forEach(item => {
            this.recalcItemRate(item, this.machine);
        });
    }

    public recalcItemRate(item: MachineItem, machine: Machine) {
        item.rate = item.count / machine.effectiveTime;
        item.totalRate = item.rate * machine.count;
    }
}
