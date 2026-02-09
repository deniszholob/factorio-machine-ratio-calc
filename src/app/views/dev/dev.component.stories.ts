import { Meta, StoryObj } from '@storybook/angular';

import { DevComponent } from './dev.component';

type ComponentWithCustomControls = DevComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Dev',
  component: DevComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Dev` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    // inputChange: { action: 'inputChange', table: { disable: true } }
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {},
};
export default meta;

export const Dev: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
