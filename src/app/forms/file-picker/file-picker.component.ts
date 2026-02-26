import { Component, input, output } from '@angular/core';
import { TooltipDirective } from 'src/app/components/generic/tooltip/tooltip.directive';

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  host: { class: 'contents' },
  imports: [TooltipDirective],
})
export class FilePickerComponent {
  public readonly $disabled = input<boolean>(false);
  public readonly $multi = input<boolean>(false);
  public readonly $filesTypesAccepted = input<string>('');
  public readonly $btnClass = input<string>('btn btn-icon btn-primary');
  public readonly $title = input<string>('');
  public readonly $fileChange = output<File[]>();

  // private readonly $fileInput =
  //   viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  // public open(): void {
  //   this.$fileInput().nativeElement.click();
  // }

  /** @see https://stackoverflow.com/questions/58351711/angular-open-file-dialog-upon-button-click */
  protected onFilesSelected(event: Event): void {
    const files: File[] = this.getFilesSelected(event);
    this.$fileChange.emit(files);
  }

  private getFilesSelected(event: Event): File[] {
    if (event.target instanceof HTMLInputElement) {
      const fileList: FileList | null = event.target.files;
      const files: File[] = fileList ? Array.from(fileList) : [];
      return files;
    }
    throw new Error(
      `Invalid ${typeof event} event, should be HTMLInputElement`,
    );
  }
}
