import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
} from '@angular/core';

import {
  ProductionChainService,
  ProductionTab,
} from 'src/app/shared/production-chain/production-chain.service';
import { ProductionChainComponent } from '../production-chain/production-chain.component';

@Component({
  selector: 'app-production-chain-list',
  templateUrl: './production-chain-list.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionChainComponent],
})
export class ProductionChainListComponent {
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $productions: Signal<ProductionTab[]> =
    this.productionChainService.$productions;
  protected readonly $activeProductionId: Signal<number> =
    this.productionChainService.$activeProductionId;
  protected readonly $editingProductionId: Signal<number | null> =
    this.productionChainService.$editingProductionId;
  protected readonly $editingName: Signal<string> =
    this.productionChainService.$editingName;

  protected onAddProduction(): void {
    this.productionChainService.addProduction();
  }

  protected onDeleteProduction(productionId: number): void {
    this.productionChainService.deleteProduction(productionId);
  }

  protected onSelectProduction(productionId: number): void {
    this.productionChainService.selectProduction(productionId);
  }

  protected onStartRename(productionId: number): void {
    this.productionChainService.startRename(productionId);
  }

  protected onCancelRename(): void {
    this.productionChainService.cancelRename();
  }

  protected onCommitRename(): void {
    this.productionChainService.commitRename();
  }

  protected onEditInput(value: string): void {
    this.productionChainService.updateEditingName(value);
  }
}
