import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { ModalComponent } from 'src/app/components/generic/modal/modal.component';
import { ProductionCatalogEditorComponent } from '../production-catalog-editor.component';

@Component({
  selector: 'app-production-catalog-editor-modal',
  templateUrl: './production-catalog-editor-modal.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ProductionCatalogEditorComponent],
})
export class ProductionCatalogEditorModalComponent {
  public readonly $show = model<boolean>(false);
}
