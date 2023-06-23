import { Meta, StoryObj } from '@storybook/angular';

import { ProductionModalComponent } from './production-modal.component';
import { MOCK_Machine } from './production.model';

type ComponentWithCustomControls = ProductionModalComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Production Modal',
  component: ProductionModalComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionModal` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    showChange: { action: 'showChange', table: { disable: true } },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    show: true,
    machine: MOCK_Machine,
  },
};
export default meta;

export const ProductionModal: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
