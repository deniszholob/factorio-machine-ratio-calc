import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  signal,
} from '@angular/core';

import { ProductionChainService } from 'src/app/shared/production-chain/production-chain.service';
import { ProductionChainItemComponent } from './production-chain-item/production-chain-item.component';
import { ProductionChain } from './production-chain-item/production-chain.model';
import { ModalComponent } from '../modal/modal.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'app-production-chain-group',
  templateUrl: './production-chain-group.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductionChainItemComponent, ModalComponent, TooltipDirective],
})
export class ProductionChainGroupComponent {
  private readonly productionChainService = inject(ProductionChainService);

  protected readonly $confirmResetOpen = signal<boolean>(false);

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

  protected onOpenResetConfirm(): void {
    this.$confirmResetOpen.set(true);
  }

  protected onConfirmReset(): void {
    this.productionChainService.resetAllProductionChains();
    this.$confirmResetOpen.set(false);
  }

  protected onResetProductionChains(): void {
    this.onOpenResetConfirm();
  }

  protected onDeleteProductionChain(productionId: string): void {
    this.productionChainService.deleteProduction(productionId);
  }

  protected onDuplicateProductionChain(productionId: string): void {
    this.productionChainService.duplicateProductionChain(productionId);
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
