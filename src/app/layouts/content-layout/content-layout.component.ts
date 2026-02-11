import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onEscape()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ContentLayoutComponent {
  public readonly $title = input.required<string>();
  public readonly $subTitle = input<string>();
  public readonly $showClose = input<boolean>(true);
  public readonly $closeLabel = input<string>();
  public readonly $close = output<void>();

  protected onEscape(): void {
    if (!this.$showClose()) {
      return;
    }
    this.$close.emit();
  }
}
