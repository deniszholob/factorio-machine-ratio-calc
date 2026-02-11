import { Meta, StoryObj } from '@storybook/angular';

import { ProductionEditorModalComponent } from './production-editor-modal.component';
import { MOCK_Machine } from '../production-editor/production.model';

type ComponentWithCustomControls = ProductionEditorModalComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Production Editor Modal',
  component: ProductionEditorModalComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionEditorModal` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    // $showChange: { action: 'showChange', table: { disable: true } },
    $show: { action: 'showModalChange' },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    $show: true,
    $machine: MOCK_Machine,
  },
};
export default meta;

export const ProductionEditorModal: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
