import { Component } from '@angular/core';
import { APP_INFO, AppInfo } from 'src/app/app.settings';

@Component({
  selector: 'app-promo-factory-time',
  templateUrl: './promo-factory-time.component.html',
  host: { class: 'contents' },
  imports: [],
})
export class PromoFactoryTimeComponent {
  protected readonly APP_INFO: AppInfo = APP_INFO;
}
