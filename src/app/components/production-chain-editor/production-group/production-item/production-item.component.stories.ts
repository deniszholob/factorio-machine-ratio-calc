import { Meta, StoryObj } from '@storybook/angular';

import { ProductionItemComponent } from './production-item.component';
import { MOCK_Machine } from '../../production-editor/production.model';

type ComponentWithCustomControls = ProductionItemComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Components/Production Item',
  component: ProductionItemComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `ProductionItem` } },
    // layout: 'fullscreen',
  },
  argTypes: {
    // Output
    $editMachine: { action: 'editMachine', table: { disable: true } },
    $deleteMachine: { action: 'deleteMachine', table: { disable: true } },
    $toggleExpanded: { action: 'toggleExpanded', table: { disable: true } },
    $addChild: { action: 'addChild', table: { disable: true } },
    // Hide
    // someControl: { table: { disable: true } }
  },
  args: {
    $machine: MOCK_Machine,
  },
};
export default meta;

export const ProductionItem: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
