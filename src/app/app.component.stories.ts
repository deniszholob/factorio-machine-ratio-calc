import { Meta, StoryObj } from '@storybook/angular';

import { AppComponent } from './app.component';

type ComponentWithCustomControls = AppComponent;

const meta: Meta<ComponentWithCustomControls> = {
  component: AppComponent,
  parameters: {
    controls: { hideNoControlsWarning: true },
    docs: { description: { component: `App` } },
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {},
};
export default meta;

export const App: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
