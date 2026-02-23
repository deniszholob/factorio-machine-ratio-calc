// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { RateUnitValueComponent } from './rate-unit-value.component';

type ComponentWithCustomControls = RateUnitValueComponent;

export default {
  component: RateUnitValueComponent,
  parameters: {
    docs: { description: { component: 'RateUnitValueComponent' } },
  },
  args: {
    $value: '12.35',
    $unit: '/s',
    $valueClass: 'text-emerald-400',
    $unitClass: 'text-emerald-300/80',
  },
} satisfies Meta<ComponentWithCustomControls>;

export const RateUnitValue: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
