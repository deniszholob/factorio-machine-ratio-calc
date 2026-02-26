import { MenuAction } from './menu-action.enum';
import { MenuItem } from './menu.component';
import { MenuItemTone } from './menu-item-tone.enum';

export const MENU_ITEMS_DOWNLOAD_DELETE: readonly MenuItem[] = [
  {
    id: MenuAction.Download,
    label: 'Download',
    iconClass: 'fas fa-download',
    tone: MenuItemTone.Default,
  },
  {
    id: MenuAction.Delete,
    label: 'Delete',
    iconClass: 'fas fa-trash-can',
    tone: MenuItemTone.Danger,
  },
];

export const MENU_ITEMS_DUPLICATE_DOWNLOAD_DELETE: readonly MenuItem[] = [
  {
    id: MenuAction.Duplicate,
    label: 'Duplicate',
    iconClass: 'fas fa-copy',
    tone: MenuItemTone.Default,
  },
  ...MENU_ITEMS_DOWNLOAD_DELETE,
];
