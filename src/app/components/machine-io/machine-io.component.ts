// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Models
import { Machine, newMachine, MachineItem, newMachineItem } from 'app/models/machine.model';

@Component({
    selector: 'app-machine-io',
    templateUrl: './machine-io.component.html',
    // styleUrls: ['./machine-io.component.scss'] // Enable as needed
})
export class MachineIoComponent implements OnInit {
    @Input()
    public machine: Machine;
    @Output()
    editMachine = new EventEmitter<Machine>();
    @Output()
    deleteMachine = new EventEmitter<Machine>();

    constructor() { }

    ngOnInit() { }

    public recalcItemRates() {
        this.machine.machineInputs.forEach(item => {
            item.rate = item.count / this.machine.effectiveTime;
            item.totalRate = item.rate * this.machine.count;
        });
        this.machine.machineOutputs.forEach(item => {
            item.rate = item.count / this.machine.effectiveTime;
            item.totalRate = item.rate * this.machine.count;
        });
    }

    public onEditMachine() {
        this.editMachine.emit(this.machine);
    }
    public onDeleteMachine() {
        this.deleteMachine.emit(this.machine);
    }
}
