import { Provider } from '@angular/core';
// import { Observable, of } from 'rxjs';

import { ProductionChainService } from './production-chain.service';
// import { ExampleReturnType } from './example-return-type.model';
// import { MOCK_ExampleReturnType } from './example-return-type.model.mock';
// export const MOCK_ExampleReturnType: ExampleReturnType = {};

export const MOCK_ProductionChainService: ProductionChainService = {
  // method(): Observable<ExampleReturnType> {
  //  return of(MOCK_ExampleReturnType);
  // },
};

export const MOCK_ProductionChainServiceProvider: Provider = {
  provide: ProductionChainService,
  useValue: MOCK_ProductionChainService,
};
