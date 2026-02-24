import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  host: { class: 'block' }, // Directive applies positioning here, cannot be "contents" unless directive logic is changed
  imports: [],
})
export class TooltipComponent {
  public $text = input.required<string>();
}
