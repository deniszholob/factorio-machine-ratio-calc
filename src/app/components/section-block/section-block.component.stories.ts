import { Meta, StoryObj } from '@storybook/angular';

import { SectionBlockComponent } from './section-block.component';

export default {
  component: SectionBlockComponent,
  parameters: {
    docs: { description: { component: 'SectionBlockComponent' } },
  },
  args: {
    $title: 'Section Title',
    $iconClass: 'fas fa-layer-group',
  },
} satisfies Meta<SectionBlockComponent>;

export const SectionBlock: StoryObj<SectionBlockComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <app-section-block [$title]="$title" [$iconClass]="$iconClass">
        <div class="rounded-md bg-stone-950/30 p-4 text-stone-200">Section content</div>
      </app-section-block>
    `,
  }),
};
