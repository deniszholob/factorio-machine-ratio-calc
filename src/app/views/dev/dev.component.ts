import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [],
})
export class DevComponent {}
