// Angular
import { Component, OnInit } from '@angular/core';

// Models
import { Machine, newMachine } from 'app/models/machine.model';

@Component({
    selector: 'app-calculator',
    templateUrl: './calculator.component.html',
    // styleUrls: ['./calculator.component.scss'] // Enable as needed
})
export class CalculatorComponent implements OnInit {
    public machines: Machine[] = [];
    public machineToEdit: Machine;

    public modalOpened = false;

    constructor() { }

    ngOnInit() {
        // Start with one machine with defaults.
        // this.machines.push(newMachine());
    }

    public onAddMachine() {
        this.machines.push(newMachine());
        this.onEditMachine(this.machines[this.machines.length - 1]);
    }

    public onEditMachine(machine: Machine) {
        this.machineToEdit = machine;
        this.modalOpened = true;
    }

    public onDeleteMachine(index: number) {
        if (index > -1) {
            this.machines.splice(index, 1);
        }
    }

    public onClearAll() {
        this.machines = [];
    }

    public openModal() {
        this.modalOpened = true;
    }

}
