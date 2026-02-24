// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { BadgeComponent } from './badge.component';
import { BadgeSize } from './badge-size.enum';
import { BadgeTone } from './badge-tone.enum';

type ComponentWithCustomControls = BadgeComponent; // & {};

export default {
  component: BadgeComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `Badge` } },
    // layout: 'fullscreen', // https://storybook.js.org/docs/configure/story-layout
  },
  argTypes: {
    /** === Input Mapping === */
    // input: { options: ['---', ...Object.values(YourEnum)], mapping: YourEnum & { '---': undefined }, control: { type: 'select' }},
    $tone: {
      options: Object.values(BadgeTone),
      mapping: BadgeTone,
      control: { type: 'select' },
    },
    $size: {
      options: Object.values(BadgeSize),
      mapping: BadgeSize,
      control: { type: 'select' },
    },
    /** === Output Actions === */
    // inputChange: { action: 'inputChange', table: { disable: true } },
    /** === Control Hide === */
    // someControl: { table: { disable: true } },
    /** === Control Disable === */
    // someControl: { control: { disable: true } },
  },
  args: {
    $label: 'Used 4',
    $tone: BadgeTone.Stone,
    $size: BadgeSize.Md,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const Badge: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  // play: async ({ canvasElement }) => { const canvasElement = within(canvasElement) },
};

export const AmberBadge: StoryObj<BadgeComponent> = {
  args: {
    $label: 'Default',
    $tone: BadgeTone.Amber,
  },
  render: (args) => ({ props: args }),
};
