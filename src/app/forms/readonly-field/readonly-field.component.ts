import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormFieldBlockComponent } from '../form-field-block/form-field-block.component';

@Component({
  selector: 'app-readonly-field',
  templateUrl: './readonly-field.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormFieldBlockComponent],
})
export class ReadonlyFieldComponent {
  public readonly $label = input<string>('');
  public readonly $className = input<string>('');
  public readonly $prefix = input<string>('');
  public readonly $suffix = input<string>('');
  public readonly $suffixIconClass = input<string>('');
  public readonly $prefixIconClass = input<string>('');
  public readonly $prefixImageUrl = input<string>('');

  public readonly $value = input<string | number | null | undefined>(undefined);
  public readonly $placeholder = input<string>('Not set');
  public readonly $valueClassName = input<string>('');

  protected readonly $displayValue = computed<string>(() => {
    const value = this.$value();
    if (value === null || value === undefined || value === '') {
      return this.$placeholder();
    }
    return String(value);
  });

  protected readonly $isPlaceholder = computed<boolean>(() => {
    const value = this.$value();
    return value === null || value === undefined || value === '';
  });
}
