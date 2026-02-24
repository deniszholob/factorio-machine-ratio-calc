export enum ImportMode {
  'Add' = 'Add',
  'Override' = 'Override',
}

export const IMPORT_MODE_OPTIONS: ImportMode[] = Object.values(ImportMode);

export function isImportMode(value: string): value is ImportMode {
  return IMPORT_MODE_OPTIONS.includes(value as ImportMode);
}

export interface ImportModeInfo {
  id: ImportMode;
  display: string;
  description: string;
}

export const IMPORT_MODE_INFO: Record<ImportMode, ImportModeInfo> = {
  [ImportMode.Add]: {
    id: ImportMode.Add,
    display: 'Add/Merge',
    description: 'Merge uploads alongside existing data.',
  },
  [ImportMode.Override]: {
    id: ImportMode.Override,
    display: 'Override',
    description: 'Replace existing data when names match.',
  },
} as const;

export const IMPORT_MODE_INFO_OPTIONS: ImportModeInfo[] =
  IMPORT_MODE_OPTIONS.map(
    (o: ImportMode): ImportModeInfo => IMPORT_MODE_INFO[o],
  );

// ====== Visualize Data ===== //
// console.log({ IMPORT_MODE_OPTIONS, IMPORT_MODE_DISPLAY, IMPORT_MODE_INFO, IMPORT_MODE_INFO_OPTIONS });
