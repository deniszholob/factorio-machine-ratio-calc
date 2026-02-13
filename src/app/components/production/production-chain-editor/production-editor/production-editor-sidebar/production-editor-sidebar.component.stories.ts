// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ProductionEditorSidebarComponent } from './production-editor-sidebar.component';
import { MOCK_Machine } from '../production.util';

type ComponentWithCustomControls = ProductionEditorSidebarComponent; // & {};

export default {
  component: ProductionEditorSidebarComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `ProductionEditorSidebar` } },
    // layout: 'fullscreen', // https://storybook.js.org/docs/configure/story-layout
  },
  argTypes: {
    /** === Input Mapping === */
    // input: { options: ['---', ...Object.values(YourEnum)], mapping: YourEnum & { '---': undefined }, control: { type: 'select' }},
    // input: { options: Object.values(YourEnum), mapping: YourEnum, control: { type: 'select' }}
    /** === Output Actions === */
    /** === Control Hide === */
    // someControl: { table: { disable: true } },
    /** === Control Disable === */
    // someControl: { control: { disable: true } },
  },
  args: {
    $machine: MOCK_Machine,
    $show: true,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const ProductionEditorSidebar: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  // play: async ({ canvasElement }) => { const canvasElement = within(canvasElement) },
};
