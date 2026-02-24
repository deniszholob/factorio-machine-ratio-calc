import { Meta, StoryObj } from '@storybook/angular';

import { SelectSingleInputComponent } from './select-single-input.component';
import { SelectInputMode } from '../select-input-mode.enum';

export default {
  component: SelectSingleInputComponent,
  parameters: {
    docs: { description: { component: 'SelectSingleInputComponent' } },
  },
  argTypes: {
    $mode: {
      options: Object.values(SelectInputMode),
      mapping: SelectInputMode,
      control: { type: 'select' },
    },
    $commit: { action: 'commit', table: { disable: true } },
  },
  args: {
    $label: 'Select Item',
    $className: 'min-w-56',
    $value: 'Iron Plate',
    $name: 'demoSelectSingle',
    $placeholder: 'Select item',
    $options: ['Iron Plate', 'Copper Plate', 'Steel Plate'],
    $mode: SelectInputMode.SelectOrCreate,
    $notFoundText: 'No matching options',
    $addTagText: 'Add custom value',
    $clearable: false,
  },
} satisfies Meta<SelectSingleInputComponent>;

export const SelectSingleInput: StoryObj<SelectSingleInputComponent> = {
  render: (args) => ({ props: args }),
};
