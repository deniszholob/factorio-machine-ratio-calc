import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-layout',
    imports: [CommonModule],
    templateUrl: './layout.component.html'
})
export class LayoutComponent {
  @Input()
  public lastUpdate: number = 0;
}
