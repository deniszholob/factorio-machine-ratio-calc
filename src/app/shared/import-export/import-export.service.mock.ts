import { Provider } from '@angular/core';
// import { Observable, of } from 'rxjs';

import { ImportExportService } from './import-export.service';
// import { ExampleReturnType } from './example-return-type.model';
// import { MOCK_ExampleReturnType } from './example-return-type.model.mock';
// export const MOCK_ExampleReturnType: ExampleReturnType = {};

export const MOCK_ImportExportService: ImportExportService = {
  // method(): Observable<ExampleReturnType> {
  //  return of(MOCK_ExampleReturnType);
  // },
};

export const MOCK_ImportExportServiceProvider: Provider = {
  provide: ImportExportService,
  useValue: MOCK_ImportExportService,
};
