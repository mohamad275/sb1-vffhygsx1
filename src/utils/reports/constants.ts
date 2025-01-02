export const COLORS = {
  PRIMARY: [46, 125, 50] as const, // Green
  SECONDARY: [63, 81, 181] as const, // Blue
  INFO: [3, 169, 244] as const, // Light Blue
  WARNING: [255, 152, 0] as const, // Orange
  DANGER: [244, 67, 54] as const, // Red
  SUCCESS: [76, 175, 80] as const, // Light Green
} as const;

export const PDF_CONFIG = {
  DEFAULT_MARGIN: 10,
  TITLE_FONT_SIZE: 24,
  HEADER_FONT_SIZE: 14,
  CONTENT_FONT_SIZE: 10,
  TABLE_SPACING: 15,
} as const;