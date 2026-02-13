export enum DataTypes {
  'ProductionChain' = 'ProductionChain',
  'Production' = 'Production',
  'Machine' = 'Machine',
  'Recipe' = 'Recipe',
  'Item' = 'Item',
}

export const DATA_TYPES_OPTIONS: DataTypes[] = Object.values(DataTypes);

export function isDataTypes(value: string): value is DataTypes {
  return DATA_TYPES_OPTIONS.includes(value as DataTypes);
}

export interface DataTypesInfo {
  id: DataTypes;
  display: string;
  description: string;
  icon: string;
}

export const DATA_TYPES_INFO: Record<DataTypes, DataTypesInfo> = {
  [DataTypes.ProductionChain]: {
    id: DataTypes.ProductionChain,
    display: 'Production Chain',
    description: 'Collection of Productions',
    icon: 'fa-solid fa-globe',
    // icon: 'fa-solid fa-truck-plane',
  },
  [DataTypes.Production]: {
    id: DataTypes.Production,
    display: 'Production',
    description: 'The combination of a Machine and a Recipe',
    icon: 'fa-solid fa-diagram-project',
  },
  [DataTypes.Machine]: {
    id: DataTypes.Machine,
    display: 'Machine',
    description:
      'An item, but automates the production of a Recipe based on time and productivity.',
    icon: 'fa-solid fa-industry',
  },
  [DataTypes.Recipe]: {
    id: DataTypes.Recipe,
    display: 'Recipe',
    description: 'A collection of inputs and outputs with a time to complete.',
    icon: 'fa-solid fa-scroll',
  },
  [DataTypes.Item]: {
    id: DataTypes.Item,
    display: 'Item',
    description:
      'A generic item. It can be used in a Recipe. Can be a machine.',
    icon: 'fa-solid fa-box',
  },
} as const;

export const DATA_TYPES_INFO_OPTIONS: DataTypesInfo[] = DATA_TYPES_OPTIONS.map(
  (o: DataTypes): DataTypesInfo => DATA_TYPES_INFO[o],
);

// ====== Visualize Data ===== //
// console.log({ DATA_TYPES_OPTIONS, DATA_TYPES_DISPLAY, DATA_TYPES_INFO, DATA_TYPES_INFO_OPTIONS });
