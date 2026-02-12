// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ProductionGroupComponent } from './production-group.component';
import { ProductionTotals } from 'src/app/shared/services/production/production.service';
import { MOCK_Machines } from '../production-chain-editor.mock';

type ComponentWithCustomControls = ProductionGroupComponent; // & {};

const totals: ProductionTotals = {
  deltas: [],
  inputs: [],
  outputs: [],
};

export default {
  title: 'Components/Production Group',
  component: ProductionGroupComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `ProductionGroup` } },
    // layout: 'fullscreen', // https://storybook.js.org/docs/configure/story-layout
  },
  argTypes: {
    /** === Input Mapping === */
    // input: { options: ['---', ...Object.values(YourEnum)], mapping: YourEnum & { '---': undefined }, control: { type: 'select' }},
    // input: { options: Object.values(YourEnum), mapping: YourEnum, control: { type: 'select' }}
    /** === Output Actions === */
    $editMachine: { action: 'editMachine', table: { disable: true } },
    $deleteMachine: { action: 'deleteMachine', table: { disable: true } },
    $updateMachineCount: {
      action: 'updateMachineCount',
      table: { disable: true },
    },
    $moveMachine: { action: 'moveMachine', table: { disable: true } },
    $toggleMachineExpanded: {
      action: 'toggleMachineExpanded',
      table: { disable: true },
    },
    $addChildMachine: { action: 'addChildMachine', table: { disable: true } },
    /** === Control Hide === */
    // someControl: { table: { disable: true } },
    /** === Control Disable === */
    // someControl: { control: { disable: true } },
  },
  args: {
    $machines: MOCK_Machines,
    $machineTotals: totals,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const ProductionGroup: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
  // play: async ({ canvasElement }) => { const canvasElement = within(canvasElement) },
};
