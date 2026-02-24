export enum CatalogEditorTab {
  'Import' = 'Import',
  'Items' = 'Items',
  'Machines' = 'Machines',
  'Recipes' = 'Recipes',
  'Productions' = 'Productions',
}

export const CATALOG_EDITOR_TAB_OPTIONS: CatalogEditorTab[] =
  Object.values(CatalogEditorTab);

export function isCatalogEditorTab(value: string): value is CatalogEditorTab {
  return CATALOG_EDITOR_TAB_OPTIONS.includes(value as CatalogEditorTab);
}

// export interface CatalogEditorTabInfo {
//   id: CatalogEditorTab;
//   display: string;
// }

// export const CATALOG_EDITOR_TAB_INFO: Record<CatalogEditorTab, CatalogEditorTabInfo> = {
//   [CatalogEditorTab.OptionId1]: {
//     id: CatalogEditorTab.OptionId1,
//     display: 'Option Id 1',
//   },
// } as const;

// export const CATALOG_EDITOR_TAB_INFO_OPTIONS: CatalogEditorTabInfo[] =
//   CATALOG_EDITOR_TAB_OPTIONS.map(
//     (o: CatalogEditorTab): CatalogEditorTabInfo => CATALOG_EDITOR_TAB_INFO[o],
//   );

// ====== Visualize Data ===== //
// console.log({ CATALOG_EDITOR_TAB_OPTIONS, CATALOG_EDITOR_TAB_DISPLAY, CATALOG_EDITOR_TAB_INFO, CATALOG_EDITOR_TAB_INFO_OPTIONS });
