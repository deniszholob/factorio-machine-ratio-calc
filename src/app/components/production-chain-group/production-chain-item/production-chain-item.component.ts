import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ProductionChain } from './production-chain.model';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-production-chain-item',
  templateUrl: './production-chain-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ModalComponent],
})
export class ProductionChainItemComponent {
  public readonly $productionChain = input.required<ProductionChain>();
  public readonly $activeProductionChainId = input.required<
    string | undefined
  >();
  public readonly $editingProductionChainId = input.required<
    string | undefined
  >();
  public readonly $editingProductionChainName = input.required<string>();

  public readonly $selectId = output<string>();
  public readonly $startRename = output<string>();
  public readonly $cancelRename = output<void>();
  public readonly $commitRename = output<void>();
  public readonly $editName = output<string>();
  public readonly $delete = output<string>();

  protected readonly $confirmDeleteOpen = signal<boolean>(false);

  private readonly $editInput =
    viewChild<ElementRef<HTMLInputElement>>('editInput');

  public constructor() {
    effect(() => {
      const productionChain = this.$productionChain();
      const editingId = this.$editingProductionChainId();
      const input = this.$editInput();

      if (!editingId || productionChain.id !== editingId || !input) {
        return;
      }

      setTimeout(() => {
        input.nativeElement.focus();
        input.nativeElement.select();
      }, 0);
    });
  }

  protected onSelect(): void {
    const productionChain = this.$productionChain();
    this.$selectId.emit(productionChain.id);
  }

  protected onSelectKey(event: Event): void {
    event.preventDefault();
    this.onSelect();
  }

  protected onStartRename(event: Event): void {
    event.stopPropagation();
    const productionChain = this.$productionChain();
    this.$startRename.emit(productionChain.id);
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.$confirmDeleteOpen.set(true);
  }

  protected onConfirmDelete(): void {
    const productionChain = this.$productionChain();
    this.$delete.emit(productionChain.id);
    this.$confirmDeleteOpen.set(false);
  }

  protected onCommitRename(event: Event): void {
    event.stopPropagation();
    this.$commitRename.emit();
  }
}
