import { Provider } from '@angular/core';
// import { Observable, of } from 'rxjs';

import { ProductionService } from './production.service';
// import { ExampleReturnType } from './example-return-type.model';
// import { MOCK_ExampleReturnType } from './example-return-type.model.mock';
// export const MOCK_ExampleReturnType: ExampleReturnType = {};

export const MOCK_ProductionService: ProductionService = {
  // method(): Observable<ExampleReturnType> {
  //  return of(MOCK_ExampleReturnType);
  // },
};

export const MOCK_ProductionServiceProvider: Provider = {
  provide: ProductionService,
  useValue: MOCK_ProductionService,
};
