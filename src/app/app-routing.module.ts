// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// View Components
import * as Views from 'app/views';

// App Routes
const routes: Routes = [
    { path: '', component: Views.CalculatorComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

// Routed App Views
export const RoutedComponents = [
    Views.CalculatorComponent,
];
