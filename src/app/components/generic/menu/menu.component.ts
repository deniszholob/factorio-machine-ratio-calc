import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MenuItemTone } from './menu-item-tone.enum';

export interface MenuItem {
  id: string;
  label: string;
  iconClass: string;
  tone: MenuItemTone;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  host: {
    class: 'contents',
    '(document:click)': 'onDocumentClick($event)',
    '(dblclick)': 'onHostDoubleClick($event)',
    '(window:resize)': 'onViewportChanged()',
    '(window:scroll)': 'onViewportChanged()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class MenuComponent {
  protected readonly MenuItemTone = MenuItemTone;
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly $triggerButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('triggerButton');

  public readonly $items = input.required<readonly MenuItem[]>();
  public readonly $menuLabel = input<string>('Menu');
  public readonly $itemSelected = output<string>();

  protected readonly $isOpen = signal<boolean>(false);
  protected readonly $menuTop = signal<number>(0);
  protected readonly $menuLeft = signal<number>(0);
  protected readonly $menuMinWidth = signal<number>(176);

  protected onToggleMenu(event: Event): void {
    event.stopPropagation();
    if (this.$isOpen()) {
      this.$isOpen.set(false);
      return;
    }
    this.updateMenuPosition();
    this.$isOpen.set(true);
  }

  protected onMenuContainerClick(event: Event): void {
    event.stopPropagation();
  }

  protected onSelectItem(event: Event, itemId: string): void {
    event.stopPropagation();
    this.$itemSelected.emit(itemId);
    this.$isOpen.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.$isOpen()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.$isOpen.set(false);
  }

  protected onHostDoubleClick(event: Event): void {
    event.stopPropagation();
  }

  protected onViewportChanged(): void {
    if (!this.$isOpen()) {
      return;
    }
    this.updateMenuPosition();
  }

  private updateMenuPosition(): void {
    const triggerElement = this.$triggerButton().nativeElement;
    const rect = triggerElement.getBoundingClientRect();
    const panelMinWidth = Math.max(176, rect.width);
    const viewportWidth = window.innerWidth;
    const nextLeft = Math.min(
      rect.right - panelMinWidth,
      viewportWidth - panelMinWidth - 8,
    );
    this.$menuTop.set(rect.bottom + 4);
    this.$menuLeft.set(Math.max(8, nextLeft));
    this.$menuMinWidth.set(panelMinWidth);
  }
}
