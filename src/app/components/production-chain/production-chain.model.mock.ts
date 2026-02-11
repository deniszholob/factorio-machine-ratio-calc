import { MOCK_Machines } from '../production-view/production-view.mock';
import { ProductionChain } from './production-chain.model';

export const MOCK_ProductionChain: ProductionChain = {
  id: '1',
  display: 'Mock Production Chain',
  productions: MOCK_Machines,
};

export const MOCK_ProductionChain_Array: ProductionChain[] = [
  MOCK_ProductionChain,
];
