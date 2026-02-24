import { Meta, StoryObj } from '@storybook/angular';

import { InputSingleComponent } from './input-single.component';

export default {
  component: InputSingleComponent,
  parameters: {
    docs: { description: { component: 'InputSingleComponent' } },
  },
  args: {
    $label: 'Input Single',
    $className: 'min-w-56',
    $value: 'Example value',
    $placeholder: 'Type value',
    $name: 'demoInputSingle',
    $type: 'text',
    $readonly: false,
  },
} satisfies Meta<InputSingleComponent>;

export const InputSingle: StoryObj<InputSingleComponent> = {
  render: (args) => ({ props: args }),
};
