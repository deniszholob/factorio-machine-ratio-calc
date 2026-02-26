import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormFieldBlockComponent } from '../../forms/form-field-block/form-field-block.component';
import { SectionTitleComponent } from './section-title/section-title.component';

@Component({
  selector: 'app-section-block',
  templateUrl: './section-block.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FormFieldBlockComponent, SectionTitleComponent],
})
export class SectionBlockComponent {
  public readonly $title = input.required<string>();
  public readonly $iconClass = input<string>('fas fa-layer-group');
  public readonly $showToolbar = input<boolean>(true);
  public readonly $showAdd = input<boolean>(true);
  public readonly $addLabel = input<string>('item');
  public readonly $filterValue = input<string>('');

  public readonly $add = output<void>();
  public readonly $filterValueChange = output<string>();

  protected onAdd(): void {
    this.$add.emit();
  }

  protected onFilterChange(value: string): void {
    this.$filterValueChange.emit(value);
  }
}
