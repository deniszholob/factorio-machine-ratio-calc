export enum SelectInputMode {
  SelectOnly = 'SelectOnly',
  SelectOrCreate = 'SelectOrCreate',
}

export const SELECT_INPUT_MODE_OPTIONS: SelectInputMode[] =
  Object.values(SelectInputMode);

export function isSelectInputMode(value: string): value is SelectInputMode {
  return SELECT_INPUT_MODE_OPTIONS.includes(value as SelectInputMode);
}

// export interface SelectInputModeInfo {
//   id: SelectInputMode;
//   display: string;
// }

// export const SELECT_INPUT_MODE_INFO: Record<SelectInputMode, SelectInputModeInfo> = {
//   [SelectInputMode.OptionId1]: {
//     id: SelectInputMode.OptionId1,
//     display: 'Option Id 1',
//   },
// } as const;

// export const SELECT_INPUT_MODE_INFO_OPTIONS: SelectInputModeInfo[] =
//   SELECT_INPUT_MODE_OPTIONS.map(
//     (o: SelectInputMode): SelectInputModeInfo => SELECT_INPUT_MODE_INFO[o],
//   );

// ====== Visualize Data ===== //
// console.log({ SELECT_INPUT_MODE_OPTIONS, SELECT_INPUT_MODE_DISPLAY, SELECT_INPUT_MODE_INFO, SELECT_INPUT_MODE_INFO_OPTIONS });
