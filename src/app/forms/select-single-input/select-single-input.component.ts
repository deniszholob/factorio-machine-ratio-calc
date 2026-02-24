import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormFieldBlockComponent } from '../form-field-block/form-field-block.component';
import { SelectInputMode } from '../select-input-mode.enum';

@Component({
  selector: 'app-select-single-input',
  templateUrl: './select-single-input.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgSelectComponent,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,
    FormFieldBlockComponent,
  ],
})
export class SelectSingleInputComponent {
  protected readonly SelectSingleInputMode = SelectInputMode;

  public readonly $label = input<string>('');
  public readonly $className = input<string>('');
  public readonly $prefix = input<string>('');
  public readonly $suffix = input<string>('');
  public readonly $suffixIconClass = input<string>('');
  public readonly $prefixIconClass = input<string>('');
  public readonly $prefixImageUrl = input<string>('');

  public readonly $value = model<string>('');
  public readonly $options = input.required<readonly string[]>();
  public readonly $placeholder = input<string>('');
  public readonly $name = input<string>('');
  public readonly $mode = input<SelectInputMode>(
    SelectInputMode.SelectOrCreate,
  );
  public readonly $notFoundText = input<string>('No matches found');
  public readonly $addTagText = input<string>('Add custom value');
  public readonly $clearable = input<boolean>(false);
  protected readonly $effectivePlaceholder = computed<string>(() => {
    if (this.$value().trim()) {
      return '';
    }
    return this.$placeholder();
  });

  public readonly $commit = output<string>();
  protected readonly $addTag = computed<boolean | ((value: string) => string)>(
    () => {
      if (this.$mode() === SelectInputMode.SelectOrCreate) {
        return this.createTag;
      }
      return false;
    },
  );

  protected onChange(value: unknown): void {
    if (typeof value !== 'string') {
      this.$value.set('');
      this.$commit.emit('');
      return;
    }
    this.$value.set(value);
    this.$commit.emit(value);
  }

  protected onBlur(): void {
    this.$commit.emit(this.$value());
  }

  protected createTag(value: string): string {
    return value.trim();
  }
}
