import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-form-field-block',
  templateUrl: './form-field-block.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class FormFieldBlockComponent {
  public readonly $label = input.required<string>();
  public readonly $className = input<string>('');
}
