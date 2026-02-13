import { MOCK_Production_Array } from './production/production.model.mock';
import { ProductionChain } from './production-chain.model';

export const MOCK_ProductionChain: ProductionChain = {
  id: '1',
  display: 'Mock Production Chain',
  productions: MOCK_Production_Array,
};

export const MOCK_ProductionChain_Array: ProductionChain[] = [
  MOCK_ProductionChain,
];
