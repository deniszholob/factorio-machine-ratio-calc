import { Meta, StoryObj } from '@storybook/angular';

import { ModalComponent } from './modal.component';

type ComponentWithCustomControls = ModalComponent;

const meta: Meta<ComponentWithCustomControls> = {
  component: ModalComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Modal` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    $title: 'My Modal',
    $show: true,
  },
};
export default meta;

export const Modal: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
