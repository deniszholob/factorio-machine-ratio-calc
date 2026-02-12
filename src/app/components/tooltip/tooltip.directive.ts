import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  OnDestroy,
  Renderer2,
  createComponent,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { TooltipComponent } from './tooltip.component';

let tooltipIdCounter = 0;

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[title]' })
export class TooltipDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private tooltipRef?: ComponentRef<TooltipComponent>;
  private readonly tooltipId: string = `app-tooltip-${tooltipIdCounter++}`;
  private readonly unlisten: Array<() => void> = [];
  private titleText = '';

  public constructor() {
    const hostElement = this.elementRef.nativeElement;

    this.renderer.setAttribute(hostElement, 'aria-describedby', this.tooltipId);
    this.renderer.addClass(hostElement, 'cursor-pointer');

    queueMicrotask(() => {
      const titleText = hostElement.title?.trim();
      if (!titleText) {
        return;
      }
      this.titleText = titleText;
      hostElement.removeAttribute('title');
      hostElement.title = '';
    });

    this.unlisten.push(
      this.renderer.listen(hostElement, 'mouseenter', () => this.show()),
      this.renderer.listen(hostElement, 'mouseleave', () => this.hide()),
      this.renderer.listen(hostElement, 'focus', () => this.show()),
      this.renderer.listen(hostElement, 'blur', () => this.hide()),
    );
  }

  public ngOnDestroy(): void {
    this.hide();
    for (const unlisten of this.unlisten) {
      unlisten();
    }
  }

  private show(): void {
    if (this.tooltipRef) {
      return;
    }

    const hostElement = this.elementRef.nativeElement;
    const titleText =
      this.titleText ||
      hostElement.getAttribute('title')?.trim() ||
      hostElement.title?.trim();

    if (!titleText) {
      return;
    }

    this.titleText = titleText;
    hostElement.removeAttribute('title');
    hostElement.title = '';

    const tooltipRef = (this.tooltipRef = createComponent(TooltipComponent, {
      environmentInjector: this.environmentInjector,
    }));
    tooltipRef.setInput('$text', titleText);
    this.appRef.attachView(tooltipRef.hostView);

    const tooltipElement = tooltipRef.location.nativeElement as HTMLElement;
    this.renderer.setAttribute(tooltipElement, 'id', this.tooltipId);
    this.renderer.setStyle(tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(tooltipElement, 'pointer-events', 'none');

    const rect = hostElement.getBoundingClientRect();
    const offset = 8;
    const top = rect.bottom + offset;
    const left = rect.left;

    this.renderer.setStyle(tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(tooltipElement, 'z-index', '50');

    this.renderer.appendChild(this.document.body, tooltipElement);
  }

  private hide(): void {
    if (!this.tooltipRef) {
      return;
    }

    const tooltipElement = this.tooltipRef.location
      .nativeElement as HTMLElement;
    if (tooltipElement.parentNode) {
      this.renderer.removeChild(this.document.body, tooltipElement);
    }
    this.appRef.detachView(this.tooltipRef.hostView);
    this.tooltipRef.destroy();
    this.tooltipRef = undefined;
  }
}
