import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ProductionEditorComponent } from '../production-editor/production-editor.component';
import { Production } from '../production-editor/production.model';

@Component({
  selector: 'app-production-editor-full',
  templateUrl: './production-editor-full.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionEditorComponent],
})
export class ProductionEditorFullComponent {
  public readonly $machine = input.required<Production | undefined>();
}
