import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  host: { class: 'contents' },
  imports: [],
})
export class FilePickerComponent {
  public readonly $disabled = input<boolean>(false);
  public readonly $multi = input<boolean>(false);
  public readonly $filesTypesAccepted = input<string>('');
  public readonly $btnClass = input<string>('btn btn-icon btn-primary');
  public readonly $fileChange = output<File[]>();

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
