// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ProductionCatalogEditorModalComponent } from './production-catalog-editor-modal.component';

type ComponentWithCustomControls = ProductionCatalogEditorModalComponent; // & {};

export default {
  title: 'Components/Production Catalog Editor Modal',
  component: ProductionCatalogEditorModalComponent,
  parameters: {
    docs: {
      description: { component: `ProductionCatalogEditorModalComponent` },
    },
  },
  argTypes: {},
  args: {
    $show: true,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const ProductionCatalogEditorModal: StoryObj<ComponentWithCustomControls> =
  {
    render: (args) => ({ props: args }),
  };
