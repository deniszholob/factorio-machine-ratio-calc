import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
} from '@angular/core';

import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';
import { ProductionChainComponent } from '../production-chain/production-chain.component';
import { ProductionChain } from '../production-chain/production-chain.model';

@Component({
  selector: 'app-production-chain-list',
  templateUrl: './production-chain-list.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionChainComponent],
})
export class ProductionChainListComponent {
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $productions: Signal<ProductionChain[]> =
    this.productionChainService.$productionChains;
  protected readonly $activeProductionId: Signal<string | undefined> =
    this.productionChainService.$activeProductionChainId;
  protected readonly $editingProductionId: Signal<string | undefined> =
    this.productionChainService.$editingProductionChainId;
  protected readonly $editingName: Signal<string> =
    this.productionChainService.$editingProductionChainDisplay;

  protected onAddProductionChain(): void {
    this.productionChainService.addProduction();
  }

  protected onDeleteProductionChain(productionId: string): void {
    this.productionChainService.deleteProduction(productionId);
  }

  protected onSelectProductionChain(productionId: string): void {
    this.productionChainService.selectProduction(productionId);
  }

  protected onStartProductionChainRename(productionId: string): void {
    this.productionChainService.startRename(productionId);
  }

  protected onCancelProductionChainRename(): void {
    this.productionChainService.cancelRename();
  }

  protected onCommitProductionChainRename(): void {
    this.productionChainService.commitRename();
  }

  protected onEditProductionChainInput(value: string): void {
    this.productionChainService.updateEditingName(value);
  }
}
