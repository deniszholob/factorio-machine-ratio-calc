import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PromoFactoryTimeComponent } from './components/generic/promo-factory-time/promo-factory-time.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: { class: 'contents' },
  imports: [RouterModule, PromoFactoryTimeComponent],
})
export class AppComponent {}
