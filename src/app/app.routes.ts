import { isDevMode } from '@angular/core';
import { Route } from '@angular/router';
import { MainComponent } from './views/main/main.component';

const DEV_ROUTE: Route[] = [];
// https://angular.dev/api/core/isDevMode?tab=description
if (isDevMode()) {
  DEV_ROUTE.push({
    path: 'dev',
    loadComponent: () =>
      import('./views/dev/dev.component').then((m) => m.DevComponent),
  });
}

export const appRoutes: Route[] = [
  { path: '', component: MainComponent },
  ...DEV_ROUTE,
  { path: '**', component: MainComponent },
  //   { path: '**', component: ViewPages.NotFoundComponent },
];
