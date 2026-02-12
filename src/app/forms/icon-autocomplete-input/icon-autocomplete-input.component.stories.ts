import { Meta, StoryObj } from '@storybook/angular';

import { IconAutocompleteInputComponent } from './icon-autocomplete-input.component';

export default {
  component: IconAutocompleteInputComponent,
  parameters: {
    docs: { description: { component: 'IconAutocompleteInputComponent' } },
  },
  argTypes: {
    $valueChange: { action: 'valueChange', table: { disable: true } },
    $commit: { action: 'commit', table: { disable: true } },
  },
  args: {
    $value: 'Iron Plate',
    $name: 'demoAutocomplete',
    $placeholder: 'Type item',
    $options: ['Iron Plate', 'Copper Plate', 'Steel Plate'],
    $iconsByName: {},
  },
} satisfies Meta<IconAutocompleteInputComponent>;

export const IconAutocompleteInput: StoryObj<IconAutocompleteInputComponent> = {
  render: (args) => ({ props: args }),
};
