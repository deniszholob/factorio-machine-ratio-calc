import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ProductionEditorComponent } from '../production-editor.component';
import { Production } from 'src/app/shared/models/production-chain/production/production.model';

@Component({
  selector: 'app-production-editor-full',
  templateUrl: './production-editor-full.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionEditorComponent],
})
export class ProductionEditorFullComponent {
  public readonly $machine = input.required<Production | undefined>();
  public readonly $machineChange = output<Production>();
}
