import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProductionShellLayoutComponent } from '../../layouts/production-shell-layout/production-shell-layout.component';
import { ProductionViewComponent } from '../production-view/production-view.component';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [ProductionShellLayoutComponent, ProductionViewComponent],
})
export class DevComponent {}
