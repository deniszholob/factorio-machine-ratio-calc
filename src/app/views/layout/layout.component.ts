import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  host: { class: 'contents' },
  imports: [CommonModule],
})
export class LayoutComponent {
  public $lastUpdate = input.required<number>();
}
