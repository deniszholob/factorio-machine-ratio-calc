import { Meta, StoryObj } from '@storybook/angular';

import { LayoutComponent } from './layout.component';

type ComponentWithCustomControls = LayoutComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Views/Layout',
  component: LayoutComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Layout` } },
    layout: 'fullscreen',
  },
  argTypes: {
    // Output
    // inputChange: { action: 'inputChange', table: { disable: true } }
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    lastUpdate: Date.now(),
  },
};
export default meta;

export const Layout: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
