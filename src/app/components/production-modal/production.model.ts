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
    totalRate: 1,
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
    name: 'Project Assembly',
    craftingSpeed: 1,
    count: 1,
    timeToComplete: 1,
    effectiveTime: 1,
    machineInputs: [],
    machineOutputs: [],
  };
  machine.machineInputs.push(newMachineItem());
  machine.machineOutputs.push(newMachineItem());
  return machine;
}

export const MOCK_Machine: Machine = newMachine();

export function reCalcItemRate(item: MachineItem, machine: Machine): void {
  item.rate = item.count / machine.effectiveTime;
  item.totalRate = item.rate * machine.count;
}

export function reCalcItemRates(
  machine: Machine,
  itemList: MachineItem[]
): void {
  itemList.forEach((item) => {
    reCalcItemRate(item, machine);
  });
}

export function reCalcProductionRates(machine: Machine): void {
  console.log(machine)
  machine.effectiveTime = machine.timeToComplete / machine.craftingSpeed;
  reCalcItemRates(machine, machine.machineInputs);
  reCalcItemRates(machine, machine.machineOutputs);
}
