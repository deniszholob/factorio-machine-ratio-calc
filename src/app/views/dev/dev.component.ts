import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProductionViewComponent } from '../../components/production-view/production-view.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { APP_BUILD_DATE } from 'src/app/app.build';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [MainLayoutComponent, ProductionViewComponent],
})
export class DevComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
}
