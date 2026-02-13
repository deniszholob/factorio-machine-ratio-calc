import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { ProductionEditorComponent } from '../production-editor.component';
import { TooltipDirective } from 'src/app/components/generic/tooltip/tooltip.directive';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';

@Component({
  selector: 'app-production-editor-sidebar',
  templateUrl: './production-editor-sidebar.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionEditorComponent, TooltipDirective],
})
export class ProductionEditorSidebarComponent {
  public readonly $machine = input.required<Production | undefined>();
  public readonly $show = model<boolean>(false);
  public readonly $machineChange = output<Production>();

  protected onClose(): void {
    this.$show.set(false);
  }
}
