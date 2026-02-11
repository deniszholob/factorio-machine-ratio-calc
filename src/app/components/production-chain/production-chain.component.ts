import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ProductionTab } from 'src/app/shared/production-chain/production-chain.service';

@Component({
  selector: 'app-production-chain',
  templateUrl: './production-chain.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class ProductionChainComponent {
  public readonly $production = input.required<ProductionTab>();
  public readonly $activeProductionId = input.required<number>();
  public readonly $editingProductionId = input.required<number | null>();
  public readonly $editingName = input.required<string>();

  public readonly $select = output<number>();
  public readonly $startRename = output<number>();
  public readonly $cancelRename = output<void>();
  public readonly $commitRename = output<void>();
  public readonly $editName = output<string>();
  public readonly $delete = output<number>();
}
