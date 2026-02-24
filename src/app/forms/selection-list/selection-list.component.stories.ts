import { Meta, StoryObj } from '@storybook/angular';

import { SelectionListComponent } from './selection-list.component';

export default {
  component: SelectionListComponent,
  parameters: {
    docs: { description: { component: 'SelectionListComponent' } },
  },
  argTypes: {
    $selectedValue: { control: { type: 'select' }, table: { disable: true } },
    /** === Output Actions === */
    // inputChange: { action: 'inputChange', table: { disable: true } },
  },
  args: {
    $name: 'editor-display',
    $type: 'radio',
    $selectedValue: 'modal',
    $defaultValue: 'modal',
    $options: [
      {
        id: 'modal',
        display: 'Modal Popup',
        description: 'Keep focus in a dialog overlay.',
      },
      {
        id: 'sidebar',
        display: 'Right Sidebar',
        description: 'Slide out editor beside the list.',
      },
    ],
  },
} satisfies Meta<SelectionListComponent<string>>;

export const SelectionList: StoryObj<SelectionListComponent<string>> = {
  render: (args) => ({ props: args }),
};
