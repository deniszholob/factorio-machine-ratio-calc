import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  // templateUrl: './section-title.component.html',
  template: `
    <div class="flex items-center gap-3">
      <h4
        class="flex items-center gap-2 text-sm font-semibold tracking-wide text-stone-200 uppercase"
      >
        @if (!!$iconClass()) {
          <span>
            <i [class]="$iconClass()"></i>
          </span>
        }
        <span>{{ $title() }}</span>
      </h4>
      <div class="h-px flex-1 bg-stone-700/70"></div>
    </div>
  `,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class SectionTitleComponent {
  public readonly $title = input.required<string>();
  public readonly $iconClass = input<string>('fas fa-layer-group');
}
