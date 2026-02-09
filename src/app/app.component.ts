import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { APP_UPDATE_DATE } from './app-update';
import { LayoutComponent } from './views/layout/layout.component';
import { ProductionViewComponent } from './views/production-view/production-view.component';
import { APP_INFO } from './app.settings';

@Component({
  imports: [RouterModule, LayoutComponent, ProductionViewComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly APP_UPDATE_DATE: number = APP_UPDATE_DATE * 1000; // s to ms
  protected readonly APP_INFO = APP_INFO;
}
