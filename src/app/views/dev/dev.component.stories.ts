import { Meta, StoryObj } from '@storybook/angular';

import { DevComponent } from './dev.component';

type ComponentWithCustomControls = DevComponent;

const meta: Meta<ComponentWithCustomControls> = {
  component: DevComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Dev` } },
    // layout: 'fullscreen',
  },
  argTypes: {},
  args: {},
};
export default meta;

export const Dev: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
