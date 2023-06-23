import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { APP_UPDATE_DATE } from './app-update';
import { LayoutComponent } from './views/layout/layout.component';
import { ProductionViewComponent } from './views/production-view/production-view.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    ProductionViewComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public readonly APP_UPDATE_DATE: number = APP_UPDATE_DATE * 1000; // s to ms
}
