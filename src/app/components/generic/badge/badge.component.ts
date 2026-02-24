import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeSize } from './badge-size.enum';
import { BadgeTone } from './badge-tone.enum';

@Component({
  selector: 'app-badge',
  template: `
    @let tone = $tone();
    @let label = $label();
    @let size = $size();

    <span
      class="inline-flex items-center justify-center border font-semibold tracking-wide uppercase"
      [ngClass]="{
        'h-5 rounded-sm px-1.5 text-[10px]': size === BadgeSize.Sm,
        'my-1 h-7 rounded px-2 text-xs': size === BadgeSize.Md,
        'border-stone-600/70 bg-stone-900/70 text-stone-300':
          tone === BadgeTone.Stone,
        'border-teal-700/70 bg-teal-950/30 text-teal-300':
          tone === BadgeTone.Teal,
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
  protected readonly BadgeSize = BadgeSize;

  public readonly $label = input.required<string>();
  public readonly $tone = input<BadgeTone>(BadgeTone.Stone);
  public readonly $size = input<BadgeSize>(BadgeSize.Md);
}
