import { Meta, StoryObj } from '@storybook/angular';

import { action } from 'storybook/actions';
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
    // $showChange: { action: 'showModalChange', table: { disable: true } },
    $show: { action: 'showModalChange' },
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
