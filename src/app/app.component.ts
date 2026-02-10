import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './views/layout/layout.component';
import { ProductionViewComponent } from './views/production-view/production-view.component';
import { APP_INFO, AppInfo } from './app.settings';
import { APP_BUILD_DATE } from './app.build';
import { DevComponent } from './views/dev/dev.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: { class: 'contents' },
  imports: [
    RouterModule,
    LayoutComponent,
    ProductionViewComponent,
    DevComponent,
  ],
})
export class AppComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
  protected readonly APP_INFO: AppInfo = APP_INFO;
}
