// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ProductionEditorFullComponent } from './production-editor-full.component';
import { MOCK_Machine } from '../production.model';

type ComponentWithCustomControls = ProductionEditorFullComponent; // & {};

export default {
  component: ProductionEditorFullComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `ProductionEditorFull` } },
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
  args: {
    $machine: MOCK_Machine,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const ProductionEditorFull: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  // play: async ({ canvasElement }) => { const canvasElement = within(canvasElement) },
};
