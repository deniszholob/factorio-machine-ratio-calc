import { Meta, StoryObj } from '@storybook/angular';

import { LayoutComponent } from './layout.component';

type ComponentWithCustomControls = LayoutComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Views/Layout',
  component: LayoutComponent,
  parameters: {
    docs: { description: { component: `Layout` } },
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {
    $lastUpdate: Date.now(),
  },
};
export default meta;

export const Layout: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
