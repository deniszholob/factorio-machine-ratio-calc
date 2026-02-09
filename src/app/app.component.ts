import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './views/layout/layout.component';
import { ProductionViewComponent } from './views/production-view/production-view.component';
import { APP_INFO } from './app.settings';
import { APP_BUILD_DATE } from './app.build';

@Component({
  imports: [RouterModule, LayoutComponent, ProductionViewComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
  protected readonly APP_INFO = APP_INFO;
}
