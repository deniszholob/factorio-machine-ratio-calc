import { Meta, StoryObj } from '@storybook/angular';

import { ProductionChainEditorComponent } from './production-chain-editor.component';

type ComponentWithCustomControls = ProductionChainEditorComponent;

const meta: Meta<ComponentWithCustomControls> = {
  component: ProductionChainEditorComponent,
  // TODO: inject mock productionService
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionChainEditor` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const ProductionChainEditor: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  args: {},
};
