import { Meta, StoryObj } from '@storybook/angular';

import { ModalComponent } from './modal.component';

type ComponentWithCustomControls = ModalComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Modal',
  component: ModalComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Modal` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    showChange: { action: 'showModalChange', table: { disable: true } },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    title: 'My Modal',
    show: true,
  },
};
export default meta;

export const Modal: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
