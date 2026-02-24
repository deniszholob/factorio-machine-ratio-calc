import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { EnumId } from 'src/app/utils/ts-types';

export interface SelectionButtonOption<T extends EnumId = string> {
  readonly id: T;
  readonly display: string;
  readonly iconClass?: string;
  readonly count?: number;
}

@Component({
  selector: 'app-selection-button-group',
  templateUrl: './selection-button-group.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class SelectionButtonGroupComponent {
  public readonly $ariaLabel = input<string>('Selection');
  public readonly $containerClass = input<string>('');
  public readonly $buttonClass = input<string>('h-8 px-3 py-0');
  public readonly $activeTone = input<'primary' | 'warning'>('primary');

  public readonly $options = input.required<readonly SelectionButtonOption[]>();

  public readonly $value = model.required<string>();

  protected onSelect(value: string): void {
    this.$value.set(value);
  }
}
