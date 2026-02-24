export enum BadgeTone {
  Stone = 'Stone',
  Amber = 'Amber',
  Red = 'Red',
  Blue = 'Blue',
}

export const BADGE_TONE_OPTIONS: BadgeTone[] = Object.values(BadgeTone);

export function isBadgeTone(value: string): value is BadgeTone {
  return BADGE_TONE_OPTIONS.includes(value as BadgeTone);
}

// export interface BadgeToneInfo {
//   id: BadgeTone;
//   display: string;
// }

// export const BADGE_TONE_INFO: Record<BadgeTone, BadgeToneInfo> = {
//   [BadgeTone.OptionId1]: {
//     id: BadgeTone.OptionId1,
//     display: 'Option Id 1',
//   },
// } as const;

// export const BADGE_TONE_INFO_OPTIONS: BadgeToneInfo[] =
//   BADGE_TONE_OPTIONS.map(
//     (o: BadgeTone): BadgeToneInfo => BADGE_TONE_INFO[o],
//   );

// ====== Visualize Data ===== //
// console.log({ BADGE_TONE_OPTIONS, BADGE_TONE_DISPLAY, BADGE_TONE_INFO, BADGE_TONE_INFO_OPTIONS });
