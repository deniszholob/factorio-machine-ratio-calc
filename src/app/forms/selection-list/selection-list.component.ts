import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { BadgeTone } from 'src/app/components/generic/badge/badge-tone.enum';
import { BadgeComponent } from 'src/app/components/generic/badge/badge.component';
import { EnumId, ObjectInfo } from 'src/app/utils/ts-types';

export interface SelectionListOption<T extends EnumId = string> {
  readonly id: T;
  readonly display: string;
  readonly description?: string;
}

export enum SelectionListType {
  'Radio' = 'Radio',
  'Checkbox' = 'Checkbox',
}

/** Html input type mapping */
const SELECTION_LIST_INPUT_TYPE_BY_TYPE: Readonly<
  Record<SelectionListType, string>
> = {
  [SelectionListType.Radio]: 'radio',
  [SelectionListType.Checkbox]: 'checkbox',
};

@Component({
  selector: 'app-selection-list',
  templateUrl: './selection-list.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
})
export class SelectionListComponent<T extends EnumId> {
  protected readonly BadgeTone = BadgeTone;
  protected readonly SelectionListType = SelectionListType;

  public readonly $name = input<string>('selection-list');
  public readonly $type = input<SelectionListType>(SelectionListType.Radio);
  public readonly $options =
    input.required<readonly SelectionListOption<T>[]>();
  public readonly $defaultValue = input<T | undefined>(undefined);

  public readonly $selectedValue = model<T | undefined>(undefined);
  public readonly $selectedValues = model<readonly T[]>([]);

  protected readonly $inputType = computed<string>(() => {
    return SELECTION_LIST_INPUT_TYPE_BY_TYPE[this.$type()];
  });

  protected readonly $selectedValueSet = computed<Set<T>>(() => {
    return new Set(this.$selectedValues());
  });

  protected onRadioChange(value: T): void {
    this.$selectedValue.set(value);
  }

  protected onCheckboxChange(value: T, checked: boolean): void {
    const nextSelection = new Set(this.$selectedValues());
    if (checked) {
      nextSelection.add(value);
    } else {
      nextSelection.delete(value);
    }
    this.$selectedValues.set([...nextSelection]);
  }

  protected onCheckboxInputChange(value: T, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    this.onCheckboxChange(value, event.target.checked);
  }
}
