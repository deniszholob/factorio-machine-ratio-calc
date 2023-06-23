import { Meta, StoryObj } from '@storybook/angular';

import { ProductionEntryComponent } from './production-entry.component';
import { MOCK_Machine } from '../production-modal/production.model';

type ComponentWithCustomControls = ProductionEntryComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Production Entry',
  component: ProductionEntryComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionEntry` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    editMachine: { action: 'editMachine', table: { disable: true } },
    deleteMachine: { action: 'deleteMachine', table: { disable: true } },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    machine: MOCK_Machine,
  },
};
export default meta;

export const ProductionEntry: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
