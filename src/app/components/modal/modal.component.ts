import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input()
  public title: string = 'Title';
  @Input()
  public primaryButton?: string = 'Save';
  @Input()
  public secondaryButton?: string = 'Cancel';

  @Input()
  public show: boolean = false;
  @Output()
  public showChange: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public primaryButtonClick: EventEmitter<void> = new EventEmitter();
  @Output()
  public secondaryButtonClick: EventEmitter<void> = new EventEmitter();

  @HostListener('document:keydown.escape', ['$event'])
  protected onKeydownHandler(event: KeyboardEvent): void {
    this.closeModal();
  }

  public closeModal(): void {
    this.show = false;
    this.showChange.emit(this.show);
  }

  public onPrimaryButtonClick(): void {
    this.primaryButtonClick.emit();
    this.closeModal();
  }

  public onSecondaryButtonClick(): void {
    this.secondaryButtonClick.emit();
    this.closeModal();
  }
}
