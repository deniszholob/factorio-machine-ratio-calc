import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  host: { class: 'contents' },
  imports: [],
})
export class TooltipComponent {
  public $text = input.required<string>();
}
