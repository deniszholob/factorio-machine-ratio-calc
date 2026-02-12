import { Meta, StoryObj } from '@storybook/angular';
import { RecipeIoListComponent } from './recipe-io-lis.component.';

export default {
  component: RecipeIoListComponent,
  parameters: {
    docs: { description: { component: 'RecipeIoListComponent' } },
  },
  argTypes: {
    $add: { action: 'add', table: { disable: true } },
    $remove: { action: 'remove', table: { disable: true } },
    $itemCountChange: { action: 'itemCountChange', table: { disable: true } },
    $itemNameCommit: { action: 'itemNameCommit', table: { disable: true } },
    $dropListDropped: { action: 'dropListDropped', table: { disable: true } },
  },
  args: {
    $label: 'Inputs',
    $items: [
      { name: 'Iron Ore', count: 1, rate: 0.5 },
      { name: 'Coal', count: 0.5, rate: 0.25 },
    ],
    $itemNameOptions: ['Iron Ore', 'Coal', 'Copper Ore'],
    $itemIconsByName: {},
    $showRates: true,
    $dragEnabled: false,
    $listId: 'story-recipe-io',
    $connectedTo: [],
    $rateUnit: 'i/s',
  },
} satisfies Meta<RecipeIoListComponent>;

export const RecipeIoList: StoryObj<RecipeIoListComponent> = {
  render: (args) => ({ props: args }),
};
