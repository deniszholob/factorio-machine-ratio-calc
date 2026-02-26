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
import { ModalComponent } from '../../generic/modal/modal.component';
import { TooltipDirective } from '../../generic/tooltip/tooltip.directive';
import { ProductionChain } from 'src/app/shared/models/production-chain/production-chain.model';
import { MenuComponent, MenuItem } from '../../generic/menu/menu.component';
import { MenuAction } from '../../generic/menu/menu-action.enum';
import { MENU_ITEMS_DUPLICATE_DOWNLOAD_DELETE } from '../../generic/menu/menu-items.constants';

@Component({
  selector: 'app-production-chain-item',
  templateUrl: './production-chain-item.component.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    ModalComponent,
    TooltipDirective,
    MenuComponent,
  ],
})
export class ProductionChainItemComponent {
  protected readonly MenuAction = MenuAction;
  protected readonly $menuItems: readonly MenuItem[] =
    MENU_ITEMS_DUPLICATE_DOWNLOAD_DELETE;

  public readonly $productionChain = input.required<ProductionChain>();
  public readonly $activeProductionChainId = input.required<
    string | undefined
  >();
  public readonly $editingProductionChainId = input.required<
    string | undefined
  >();
  public readonly $editingProductionChainName = input.required<string>();
  public readonly $editingProductionChainIconUrl = input.required<string>();

  public readonly $selectId = output<string>();
  public readonly $startRename = output<string>();
  public readonly $cancelRename = output<void>();
  public readonly $commitRename = output<void>();
  public readonly $editName = output<string>();
  public readonly $editIconUrl = output<string>();
  public readonly $delete = output<string>();
  public readonly $duplicate = output<string>();
  public readonly $download = output<string>();

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

  protected onDelete(): void {
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

  protected onDuplicate(): void {
    const productionChain = this.$productionChain();
    this.$duplicate.emit(productionChain.id);
  }

  protected onDownload(): void {
    const productionChain = this.$productionChain();
    this.$download.emit(productionChain.id);
  }

  protected onMenuAction(actionId: string): void {
    if (actionId === MenuAction.Download) {
      this.onDownload();
      return;
    }
    if (actionId === MenuAction.Duplicate) {
      this.onDuplicate();
      return;
    }
    if (actionId === MenuAction.Delete) {
      this.onDelete();
    }
  }
}
