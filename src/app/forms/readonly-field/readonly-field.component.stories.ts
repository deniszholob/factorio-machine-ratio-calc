import { Meta, StoryObj } from '@storybook/angular';

import { ReadonlyFieldComponent } from './readonly-field.component';

export default {
  component: ReadonlyFieldComponent,
  parameters: {
    docs: { description: { component: 'ReadonlyFieldComponent' } },
  },
  args: {
    $label: 'Production Name',
    $className: 'min-w-56',
    $value: 'Iron Gear Wheel',
    $placeholder: 'Not set',
    $valueClassName: '',
  },
} satisfies Meta<ReadonlyFieldComponent>;

export const ReadonlyField: StoryObj<ReadonlyFieldComponent> = {
  render: (args) => ({ props: args }),
};
