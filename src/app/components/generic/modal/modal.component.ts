import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onKeydownHandler()',
  },
  imports: [],
})
export class ModalComponent {
  public readonly $title = input<string>('Title');
  public readonly $primaryButton = input<string | undefined>('Save');
  public readonly $secondaryButton = input<string | undefined>('Cancel');
  public readonly $bodyClass = input<string>('flex-auto overflow-auto p-6');
  public readonly $show = model<boolean>(false);

  public readonly $primaryButtonClick = output<void>();
  public readonly $secondaryButtonClick = output<void>();

  protected onKeydownHandler(): void {
    this.closeModal();
  }

  protected closeModal(): void {
    this.$show.set(false);
  }

  protected onPrimaryButtonClick(): void {
    this.$primaryButtonClick.emit();
    this.closeModal();
  }

  protected onSecondaryButtonClick(): void {
    this.$secondaryButtonClick.emit();
    this.closeModal();
  }
}
