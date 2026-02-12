import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { ProductionEditorComponent } from '../production-editor.component';
import { Production } from '../production.model';

@Component({
  selector: 'app-production-editor-modal',
  templateUrl: './production-editor-modal.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ProductionEditorComponent],
})
export class ProductionEditorModalComponent {
  public readonly $machine = input.required<Production | undefined>();
  public readonly $show = model<boolean>(false);
  public readonly $machineChange = output<Production>();
}
