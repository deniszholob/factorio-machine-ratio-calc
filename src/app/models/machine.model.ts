
export interface MachineItem {
    name: string;
    count: number;
    rate: number;
    totalRate: number;
}

export function newMachineItem(): MachineItem {
    return {
        name: 'Default-Item',
        count: 1,
        rate: 1,
        totalRate: 1
    };
}

export interface Machine {
    name: string;
    count: number;
    craftingSpeed: number;
    timeToComplete: number;
    effectiveTime: number;
    machineInputs: MachineItem[];
    machineOutputs: MachineItem[];
}

export function newMachine(): Machine {
    const machine: Machine = {
        name: 'Default-Machine',
        craftingSpeed: 1,
        count: 1,
        timeToComplete: 1,
        effectiveTime: 1,
        machineInputs: [],
        machineOutputs: []
    };
    machine.machineInputs.push(newMachineItem());
    machine.machineOutputs.push(newMachineItem());
    return machine;
}
