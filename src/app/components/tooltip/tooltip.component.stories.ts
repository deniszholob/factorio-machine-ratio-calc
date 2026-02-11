// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { TooltipComponent } from './tooltip.component';

type ComponentWithCustomControls = TooltipComponent; // & {};

export default {
  // TODO: Make sure this title path is correct, uncomment tile, then remove this comment. OR remove both comment and title
  // title: 'Components/Tooltip',
  component: TooltipComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `Tooltip` } },
    // layout: 'fullscreen', // https://storybook.js.org/docs/configure/story-layout
  },
  argTypes: {
    /** === Input Mapping === */
    // input: { options: ['---', ...Object.values(YourEnum)], mapping: YourEnum & { '---': undefined }, control: { type: 'select' }},
    // input: { options: Object.values(YourEnum), mapping: YourEnum, control: { type: 'select' }}
    /** === Output Actions === */
    // inputChange: { action: 'inputChange', table: { disable: true } },
    /** === Control Hide === */
    // someControl: { table: { disable: true } },
     /** === Control Disable === */
    // someControl: { control: { disable: true } },
  },
  args: {},
} satisfies Meta<ComponentWithCustomControls>

export const Tooltip: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  // play: async ({ canvasElement }) => { const canvasElement = within(canvasElement) },
}
