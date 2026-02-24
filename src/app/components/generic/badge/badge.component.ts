import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeTone } from './badge-tone.enum';

@Component({
  selector: 'app-badge',
  // templateUrl: './badge.component.html',
  template: `
    @let tone = $tone();
    @let label = $label();

    <span
      class="rounded-full border px-2 py-0.5 text-xs font-light tracking-wide uppercase"
      [ngClass]="{
        'border-stone-700/70 bg-stone-900/70 text-stone-300':
          tone === BadgeTone.Stone,
        'border-amber-500/40 bg-amber-500/10 text-amber-200':
          tone === BadgeTone.Amber,
        'border-red-500/40 bg-red-500/10 text-red-200': tone === BadgeTone.Red,
        'border-blue-500/40 bg-blue-500/10 text-blue-200':
          tone === BadgeTone.Blue,
      }"
    >
      {{ label }}
    </span>
  `,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class BadgeComponent {
  protected readonly BadgeTone = BadgeTone;

  public readonly $label = input.required<string>();
  public readonly $tone = input<BadgeTone>(BadgeTone.Stone);
}
