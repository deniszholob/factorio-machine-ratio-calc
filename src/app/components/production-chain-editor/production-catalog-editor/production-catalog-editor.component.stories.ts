// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ProductionCatalogEditorComponent } from './production-catalog-editor.component';

type ComponentWithCustomControls = ProductionCatalogEditorComponent; // & {};

export default {
  title: 'Components/Production Catalog Editor',
  component: ProductionCatalogEditorComponent,
  parameters: {
    docs: { description: { component: `ProductionCatalogEditorComponent` } },
  },
  argTypes: {},
  args: {},
} satisfies Meta<ComponentWithCustomControls>;

export const ProductionCatalogEditor: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
