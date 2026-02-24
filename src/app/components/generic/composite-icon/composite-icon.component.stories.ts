// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { CompositeIconComponent } from './composite-icon.component';

type ComponentWithCustomControls = CompositeIconComponent; // & {};

export default {
  component: CompositeIconComponent,
  parameters: {
    docs: { description: { component: `CompositeIcon` } },
  },
  argTypes: {},
  args: {
    $primaryLabel: 'Assembling Machine',
    $secondaryLabel: 'Iron Gear Wheel',
    $primaryIconUrl:
      'https://wiki.factorio.com/images/Assembling_machine_2.png',
    $secondaryIconUrl: 'https://wiki.factorio.com/images/Iron_gear_wheel.png',
    $missingIconTitle: 'Provide an icon in the Catalog',
  },
} satisfies Meta<ComponentWithCustomControls>;

export const CompositeIcon: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};

export const MissingIcons: StoryObj<ComponentWithCustomControls> = {
  args: {
    $primaryIconUrl: undefined,
    $secondaryIconUrl: undefined,
  },
  render: (args) => ({ props: args }),
};
