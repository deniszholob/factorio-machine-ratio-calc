import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Styles/Buttons',
  parameters: {
    docs: { description: { component: 'Button style variants for visual testing.' } },
  },
};

export default meta;

type Story = StoryObj;

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-2 p-4">
        <button class="btn" type="button">btn</button>
        <button class="btn btn-primary" type="button">primary</button>
        <button class="btn btn-primary-outline-fill" type="button">primary Outline Fill</button>
        <button class="btn btn-primary-outline" type="button">primary Outline</button>

        <button class="btn btn-secondary" type="button">secondary</button>
        <button class="btn btn-secondary-outline-fill" type="button">secondary Outline Fill</button>
        <button class="btn btn-secondary-outline" type="button">secondary Outline</button>

        <button class="btn btn-success" type="button">success</button>
        <button class="btn btn-success-outline-fill" type="button">success Outline Fill</button>
        <button class="btn btn-success-outline" type="button">success Outline</button>

        <button class="btn btn-warning" type="button">warning</button>
        <button class="btn btn-warning-outline-fill" type="button">warning Outline Fill</button>
        <button class="btn btn-warning-outline" type="button">warning Outline</button>

        <button class="btn btn-danger" type="button">danger</button>
        <button class="btn btn-danger-outline-fill" type="button">danger Outline Fill</button>
        <button class="btn btn-danger-outline" type="button">danger Outline</button>
      </div>
    `,
  }),
};
