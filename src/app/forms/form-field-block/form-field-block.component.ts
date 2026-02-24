import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-form-field-block',
  templateUrl: './form-field-block.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class FormFieldBlockComponent {
  public readonly $label = input<string>('');
  public readonly $className = input<string>('');
  public readonly $showFrame = input<boolean>(true);
  public readonly $prefix = input<string>('');
  public readonly $suffix = input<string>('');
  public readonly $suffixIconClass = input<string>('');
  public readonly $prefixIconClass = input<string>('');
  public readonly $prefixImageUrl = input<string>('');
  protected readonly $hasPrefixAddon = computed<boolean>(() => {
    return Boolean(
      this.$prefix() || this.$prefixIconClass() || this.$prefixImageUrl(),
    );
  });
  protected readonly $hasSuffixAddon = computed<boolean>(() => {
    return Boolean(this.$suffix() || this.$suffixIconClass());
  });
  protected readonly $hasAddon = computed<boolean>(() => {
    return this.$hasPrefixAddon() || this.$hasSuffixAddon();
  });
  protected readonly $hasImagePrefixOnly = computed<boolean>(() => {
    return Boolean(
      this.$prefixImageUrl() && !this.$prefix() && !this.$prefixIconClass(),
    );
  });
}
