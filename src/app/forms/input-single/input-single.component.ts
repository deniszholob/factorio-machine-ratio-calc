import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormFieldBlockComponent } from '../form-field-block/form-field-block.component';

@Component({
  selector: 'app-input-single',
  templateUrl: './input-single.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FormFieldBlockComponent],
})
export class InputSingleComponent {
  public readonly $label = input<string>('');
  public readonly $className = input<string>('');
  public readonly $prefix = input<string>('');
  public readonly $suffix = input<string>('');
  public readonly $suffixIconClass = input<string>('');
  public readonly $prefixIconClass = input<string>('');
  public readonly $prefixImageUrl = input<string>('');

  public readonly $value = model<string>('');
  public readonly $placeholder = input<string>('');
  public readonly $name = input<string>('');
  public readonly $type = input<'text' | 'number' | 'url' | 'email' | 'search'>('text');
  public readonly $readonly = input<boolean>(false);

  public readonly $commit = output<string>();

  protected onValueChange(value: string): void {
    this.$value.set(value);
  }

  protected onCommit(value: string): void {
    this.$commit.emit(value);
  }
}
