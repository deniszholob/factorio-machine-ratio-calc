import { Meta, StoryObj } from '@storybook/angular';

import { MenuComponent, MenuItem } from './menu.component';
import { MenuItemTone } from './menu-item-tone.enum';

type ComponentWithCustomControls = MenuComponent;

const items: readonly MenuItem[] = [
  {
    id: 'download',
    label: 'Download',
    iconClass: 'fas fa-download',
    tone: MenuItemTone.Default,
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    iconClass: 'fas fa-copy',
    tone: MenuItemTone.Default,
  },
  {
    id: 'delete',
    label: 'Delete',
    iconClass: 'fas fa-trash',
    tone: MenuItemTone.Danger,
  },
];

export default {
  component: MenuComponent,
  parameters: {
    docs: { description: { component: `Menu` } },
  },
  argTypes: {
    $itemSelected: { action: 'itemSelected', table: { disable: true } },
  },
  args: {
    $menuLabel: 'Actions',
    $items: items,
  },
} satisfies Meta<ComponentWithCustomControls>;

export const Menu: StoryObj<ComponentWithCustomControls> = {
  render: (args) => ({ props: args }),
};
