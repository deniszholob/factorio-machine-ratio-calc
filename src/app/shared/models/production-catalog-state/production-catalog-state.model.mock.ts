import { ProductionCatalogState } from './production-catalog-state.model';

export const MOCK_ProductionCatalogState: ProductionCatalogState = {
  items: [
    {
      name: 'Test Item 1',
      craftingSpeed: 1,
      productivity: 1,
      drain: 1,
      isMachine: false,
      iconUrl: '',
    },
  ],
  recipes: [
    {
      name: 'Test Recipe 1',
      iconUrl: '',
      timeToComplete: 1,
      inputs: [
        {
          name: 'Test Item 1',
          count: 1,
        },
      ],
      outputs: [
        {
          name: 'Test Item 1',
          count: 1,
        },
      ],
    },
  ],
  productions: [
    {
      name: 'Test Production 1',
      iconUrl: '',
      production: {
        id: '1',
        name: 'Test Production 1',
        machine: {
          name: 'Test Machine 1',
          craftingSpeed: 1,
          productivity: 1,
          drain: 1,
        },
        count: 1,
        effectiveTime: 1,
        recipe: {
          name: 'Test Recipe 1',
          iconUrl: '',
          timeToComplete: 1,
          inputs: [],
          outputs: [],
        },
        isExpanded: true,
        iconUrl: '',
        parentProductionId: '',
      },
    },
  ],
};

export const MOCK_ProductionCatalogState_Array: ProductionCatalogState[] = [
  MOCK_ProductionCatalogState,
];
