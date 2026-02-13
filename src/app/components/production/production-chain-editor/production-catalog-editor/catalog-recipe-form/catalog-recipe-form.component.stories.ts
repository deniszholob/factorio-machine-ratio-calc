import { Meta, StoryObj } from '@storybook/angular';
import { CatalogRecipeFormComponent } from './catalog-recipe-form.component';

export default {
  component: CatalogRecipeFormComponent,
  parameters: {
    docs: { description: { component: 'CatalogRecipeFormComponent' } },
  },
  argTypes: {
    $recipeChange: { action: 'recipeChange', table: { disable: true } },
    $removeRecipe: { action: 'removeRecipe', table: { disable: true } },
    $addRecipeItem: { action: 'addRecipeItem', table: { disable: true } },
    $removeRecipeItem: {
      action: 'removeRecipeItem',
      table: { disable: true },
    },
  },
  args: {
    $recipe: {
      name: 'Iron Plate',
      iconUrl: '',
      timeToComplete: 3.2,
      inputs: [{ name: 'Iron Ore', count: 1 }],
      outputs: [{ name: 'Iron Plate', count: 1 }],
    },
    $itemNames: ['Iron Ore', 'Iron Plate', 'Copper Ore'],
    $itemIconsByName: {},
  },
} satisfies Meta<CatalogRecipeFormComponent>;

export const CatalogRecipeForm: StoryObj<CatalogRecipeFormComponent> = {
  render: (args) => ({ props: args }),
};
