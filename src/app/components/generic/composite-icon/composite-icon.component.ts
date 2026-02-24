import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-composite-icon',
  templateUrl: './composite-icon.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class CompositeIconComponent {
  public readonly $primaryIconUrl = input<string | undefined>(undefined);
  public readonly $primaryLabel = input<string>('');
  public readonly $secondaryIconUrl = input<string | undefined>(undefined);
  public readonly $secondaryLabel = input<string>('');
  public readonly $missingIconTitle = input<string>('Provide an icon in the Catalog');
}
