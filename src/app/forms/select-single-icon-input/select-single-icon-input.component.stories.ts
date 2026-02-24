import { Meta, StoryObj } from '@storybook/angular';

import { SelectSingleIconInputComponent } from './select-single-icon-input.component';
import { SelectInputMode } from '../select-input-mode.enum';

export default {
  component: SelectSingleIconInputComponent,
  parameters: {
    docs: { description: { component: 'SelectSingleIconInputComponent' } },
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
    $label: 'Select Item With Icon',
    $className: 'min-w-56',
    $value: 'Iron Plate',
    $name: 'demoSelectSingleIcon',
    $placeholder: 'Select item',
    $options: ['Iron Plate', 'Copper Plate', 'Steel Plate'],
    $iconsByName: {
      'Iron Plate': 'https://wiki.factorio.com/images/Iron_plate.png',
      'Copper Plate': 'https://wiki.factorio.com/images/Copper_plate.png',
    },
    $mode: SelectInputMode.SelectOrCreate,
    $notFoundText: 'No matching options',
    $addTagText: 'Add custom value',
    $showSelectedIcon: true,
  },
} satisfies Meta<SelectSingleIconInputComponent>;

export const SelectSingleIconInput: StoryObj<SelectSingleIconInputComponent> = {
  render: (args) => ({ props: args }),
};
