// @ref https://storybook.js.org/docs/writing-stories
import { Meta, StoryObj } from '@storybook/angular';

import { ContentLayoutComponent } from './content-layout.component';

type ComponentWithCustomControls = ContentLayoutComponent; // & {};

export default {
  component: ContentLayoutComponent,
  // decorators: [moduleMetadata({ imports: [] }), applicationConfig({ providers: [ importProvidersFrom() ]})],
  parameters: {
    docs: { description: { component: `ContentLayout` } },
    // layout: 'fullscreen', // https://storybook.js.org/docs/configure/story-layout
  },
  argTypes: {
    /** === Input Mapping === */
    // input: { options: ['---', ...Object.values(YourEnum)], mapping: YourEnum & { '---': undefined }, control: { type: 'select' }},
    // input: { options: Object.values(YourEnum), mapping: YourEnum, control: { type: 'select' }}
    /** === Output Actions === */
    $close: { action: 'close', table: { disable: true } },
    /** === Control Hide === */
    // someControl: { table: { disable: true } },
    /** === Control Disable === */
    // someControl: { control: { disable: true } },
  },
  args: {
    $title: 'Title',
    $subTitle: 'Sub Title',
    $showClose: true,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const ContentLayout: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({
    props: args,
    template: `
      <app-content-layout
        [$title]="$title"
        [$subTitle]="$subTitle"
        [$showClose]="$showClose"
        ($close)="$close()"
      >
        <div ngProjectAs="content-header">
          <button class="btn btn-primary-outline">Header Action</button>
        </div>
        <div class="p-6 text-sm text-stone-300">Content goes here.</div>
      </app-content-layout>
    `,
  }),
};
