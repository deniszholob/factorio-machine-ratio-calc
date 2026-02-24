import { Meta, StoryObj } from '@storybook/angular';

import {
  SelectionButtonActiveTone,
  SelectionButtonGroupComponent,
} from './selection-button-group.component';

export default {
  component: SelectionButtonGroupComponent,
  parameters: {
    docs: { description: { component: 'SelectionButtonGroupComponent' } },
  },
  argTypes: {
    $activeTone: {
      options: Object.values(SelectionButtonActiveTone),
      mapping: SelectionButtonActiveTone,
      control: { type: 'select' },
    },
  },
  args: {
    $value: 'items',
    $options: [
      {
        id: 'import',
        display: 'Import',
        count: 5,
        iconClass: 'fas fa-right-left',
      },
      { id: 'items', display: 'Items', count: 15, iconClass: 'fas fa-box' },
      {
        id: 'machines',
        display: 'Machines',
        count: 8,
        iconClass: 'fas fa-industry',
      },
    ],
    $ariaLabel: 'Selection',
    $activeTone: SelectionButtonActiveTone.Primary,
    $buttonClass: 'h-8 px-3 py-0',
    $containerClass: '',
  },
} satisfies Meta<SelectionButtonGroupComponent>;

export const SelectionButtonGroup: StoryObj<SelectionButtonGroupComponent> = {
  render: (args) => ({ props: args }),
};
