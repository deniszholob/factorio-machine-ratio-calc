import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-rate-unit-value',
  templateUrl: './rate-unit-value.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class RateUnitValueComponent {
  public readonly $value = input.required<string | number | null>();
  public readonly $unit = input<string>('/s');
  public readonly $valueClass = input<string>('');
  public readonly $unitClass = input<string>('opacity-70');
}
