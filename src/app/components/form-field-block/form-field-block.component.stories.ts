import { Meta, StoryObj } from '@storybook/angular';

import { FormFieldBlockComponent } from './form-field-block.component';

export default {
  component: FormFieldBlockComponent,
  parameters: {
    docs: { description: { component: 'FormFieldBlockComponent' } },
  },
  args: {
    $label: 'Name',
    $className: 'min-w-56',
  },
} satisfies Meta<FormFieldBlockComponent>;

export const FormFieldBlock: StoryObj<FormFieldBlockComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <app-form-field-block [$label]="$label" [$className]="$className">
        <input class="h-9" placeholder="Value" />
      </app-form-field-block>
    `,
  }),
};
