import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { ProductionViewComponent } from 'src/app/components/production-view/production-view.component';
import { APP_BUILD_DATE } from 'src/app/app.build';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  host: { class: 'contents' },
  imports: [LayoutComponent, ProductionViewComponent],
})
export class MainComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
}
