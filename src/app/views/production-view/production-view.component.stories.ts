import { Meta, StoryObj } from '@storybook/angular';

import { ProductionViewComponent } from './production-view.component';
import { MOCK_Machines } from './production-view.mock';

type ComponentWithCustomControls = ProductionViewComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Views/Production View',
  component: ProductionViewComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionView` } },
  },
  argTypes: {},
  args: {
    machines: MOCK_Machines,
  },
};
export default meta;

export const ProductionView: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
};
