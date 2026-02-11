import { Meta, StoryObj } from '@storybook/angular';

import { ProductionViewComponent } from './production-view.component';

type ComponentWithCustomControls = ProductionViewComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Views/Production View',
  component: ProductionViewComponent,
  // TODO: inject mock productionService
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionView` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const ProductionView: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  args: {},
};
