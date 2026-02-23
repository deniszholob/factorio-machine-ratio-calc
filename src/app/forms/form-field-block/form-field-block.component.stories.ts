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
    $suffix: '',
    $prefix: '',
    $prefixIconClass: '',
  },
} satisfies Meta<FormFieldBlockComponent>;

export const FormFieldBlock: StoryObj<FormFieldBlockComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <app-form-field-block
        [$label]="$label"
        [$className]="$className"
        [$prefix]="$prefix"
        [$suffix]="$suffix"
        [$prefixIconClass]="$prefixIconClass"
      >
        <input class="h-9" placeholder="Value" />
      </app-form-field-block>
    `,
  }),
};

export const FormFieldBlockSuffix: StoryObj<FormFieldBlockComponent> = {
  args: {
    $label: 'Craft Speed',
    $className: 'max-w-28',
    $suffix: 'x',
    $prefixIconClass: 'fas fa-gauge',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-form-field-block
        [$label]="$label"
        [$className]="$className"
        [$prefix]="$prefix"
        [$suffix]="$suffix"
        [$prefixIconClass]="$prefixIconClass"
      >
        <input class="h-9" placeholder="1.0" type="number" />
      </app-form-field-block>
    `,
  }),
};
