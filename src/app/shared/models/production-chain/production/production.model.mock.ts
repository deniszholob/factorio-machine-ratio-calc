import { Production } from './production.model';

export const MOCK_Production: Production = {
  id: 'mock-1',
  name: 'Green Circuits in Assembler 1',
  isExpanded: true,
  count: 2,
  effectiveTime: 0.6666666666666666,
  recipe: {
    name: 'Green Circuits',
    timeToComplete: 0.5,
    inputs: [
      { name: 'Iron Plate', count: 1, rate: 1.5, totalRate: 3 },
      { name: 'Copper Cable', count: 3, rate: 4.5, totalRate: 9 },
    ],
    outputs: [
      { name: 'Electronic circuit', count: 1, rate: 1.5, totalRate: 3 },
    ],
  },
  machine: {
    name: 'Assembler 1',
    craftingSpeed: 0.75,
    productivity: 1,
  },
};

export const MOCK_Production_Array: Production[] = [
  MOCK_Production,
  {
    id: 'mock-2',
    name: 'Iron in Furnace',
    isExpanded: true,
    count: 9.6,
    effectiveTime: 3.2,
    recipe: {
      name: 'Iron',
      timeToComplete: 3.2,
      inputs: [{ name: 'Iron Ore', count: 1, rate: 0.3125, totalRate: 3 }],
      outputs: [{ name: 'Iron Plate', count: 1, rate: 0.3125, totalRate: 3 }],
    },
    machine: {
      name: 'Furnace',
      craftingSpeed: 1,
      productivity: 1,
    },
  },
  {
    id: 'mock-3',
    name: 'Wire in Assembler 1',
    isExpanded: true,
    count: 3,
    effectiveTime: 0.6666666666666666,
    recipe: {
      name: 'Wire',
      timeToComplete: 0.5,
      inputs: [{ name: 'Copper Plate', count: 1, rate: 1.5, totalRate: 4.5 }],
      outputs: [{ name: 'Copper Cable', count: 2, rate: 3, totalRate: 9 }],
    },
    machine: {
      name: 'Assembler 1',
      craftingSpeed: 0.75,
      productivity: 1,
    },
  },
  {
    id: 'mock-4',
    name: 'Copper in Furnace',
    isExpanded: true,
    count: 14.4,
    effectiveTime: 3.2,
    recipe: {
      name: 'Copper',
      timeToComplete: 3.2,
      inputs: [{ name: 'Copper Ore', count: 1, rate: 0.3125, totalRate: 4.5 }],
      outputs: [
        { name: 'Copper Plate', count: 1, rate: 0.3125, totalRate: 4.5 },
      ],
    },
    machine: {
      name: 'Furnace',
      craftingSpeed: 1,
      productivity: 1,
    },
  },
];
