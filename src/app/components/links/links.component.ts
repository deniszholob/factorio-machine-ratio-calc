import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksComponent {}
