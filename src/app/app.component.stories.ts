import { Meta, StoryObj } from '@storybook/angular';

import { AppComponent } from './app.component';

type ComponentWithCustomControls = AppComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'App',
  component: AppComponent,
  // decorators: [moduleMetadata({imports: []})],
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
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
