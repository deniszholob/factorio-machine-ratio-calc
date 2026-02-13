import { MachineItem } from '../machine-item/machine-item.model';

export interface ProductionRecipe {
  name: string;
  iconUrl?: string;
  useAutoName?: boolean;
  useAutoIcon?: boolean;
  timeToComplete: number;
  inputs: MachineItem[];
  outputs: MachineItem[];
}
