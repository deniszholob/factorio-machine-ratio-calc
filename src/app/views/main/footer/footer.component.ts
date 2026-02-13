import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_BUILD_DATE } from 'src/app/app.build';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  host: { class: 'contents' },
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly APP_BUILD_DATE: number = APP_BUILD_DATE;
}
