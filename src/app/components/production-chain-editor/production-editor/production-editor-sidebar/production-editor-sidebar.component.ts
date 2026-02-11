import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

import { ProductionEditorComponent } from '../production-editor/production-editor.component';
import { Production } from '../production-editor/production.model';

@Component({
  selector: 'app-production-editor-sidebar',
  templateUrl: './production-editor-sidebar.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionEditorComponent],
})
export class ProductionEditorSidebarComponent {
  public readonly $machine = input.required<Production | undefined>();
  public readonly $show = model<boolean>(false);

  protected onClose(): void {
    this.$show.set(false);
  }
}
