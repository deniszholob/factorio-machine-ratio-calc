import { FilePickerComponent } from './file-picker.component';

describe('FilePickerComponent', () => {
  let component: FilePickerComponent = new FilePickerComponent();

  beforeEach(() => {
    component = new FilePickerComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
