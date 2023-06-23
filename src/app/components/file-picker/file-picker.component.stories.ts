import { Meta, StoryObj } from '@storybook/angular';

import { FilePickerComponent } from './file-picker.component';

type ComponentWithCustomControls = FilePickerComponent & {
  title: string;
};

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/File Picker',
  component: FilePickerComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `FilePicker` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    fileChange: { action: 'fileChange', table: { disable: true } },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    title: 'Upload',
    btnClass: 'btn btn-icon btn-primary',
    disabled: false,
    multi: false,
    filesTypesAccepted: '.json',
  },
};
export default meta;

export const FilePicker: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({
    props: args,
    template: `
    <app-file-picker
      [disabled]="disabled"
      [multi]="multi"
      [filesTypesAccepted]="filesTypesAccepted"
      [btnClass]="btnClass"
      (fileChange)="fileChange()"
    >
      <i class="fas fa-upload"></i>
      {{title}}
    </app-file-picker>
    `,
  }),
};
