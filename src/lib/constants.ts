export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const DIGITS = '0123456789'.split('');
export const ALL_CHARACTERS = [...UPPERCASE, ...LOWERCASE, ...DIGITS];

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 500;

export const FONT_UNITS_PER_EM = 1000;
export const FONT_ASCENDER = 800;
export const FONT_DESCENDER = -200;

export const GUIDE_LINES = {
  ascender: 30,
  capHeight: 70,
  xHeight: 220,
  baseline: 400,
  descender: 470,
};

export function canvasToFontX(canvasX: number): number {
  return (canvasX / CANVAS_WIDTH) * 700;
}

export function canvasToFontY(canvasY: number): number {
  const range = GUIDE_LINES.descender - GUIDE_LINES.ascender;
  return FONT_ASCENDER - ((canvasY - GUIDE_LINES.ascender) / range) * FONT_UNITS_PER_EM;
}
