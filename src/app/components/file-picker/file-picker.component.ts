import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-picker.component.html',
})
export class FilePickerComponent {
  @Input()
  public disabled: boolean = false;
  @Input()
  public multi: boolean = false;
  @Input()
  public filesTypesAccepted: string = '';
  @Input()
  public btnClass: string = 'btn btn-icon btn-primary';
  @Output()
  public fileChange: EventEmitter<File[]> = new EventEmitter<File[]>();

  /** @see https://stackoverflow.com/questions/58351711/angular-open-file-dialog-upon-button-click */
  public onFilesSelected(event: Event): void {
    const files: File[] = this.getFilesSelected(event);
    this.fileChange.emit(files);
  }

  private getFilesSelected(event: Event): File[] {
    if (event.target instanceof HTMLInputElement) {
      const fileList: FileList | null = event.target.files;
      const files: File[] = fileList ? Array.from(fileList) : [];
      return files;
    }
    throw new Error(
      `Invalid ${typeof event} event, should be HTMLInputElement`
    );
  }
}
