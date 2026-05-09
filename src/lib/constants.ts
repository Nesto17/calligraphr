export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const DIGITS = '0123456789'.split('');
export const SYMBOLS = '!?@#$%^&*;:\'"\~-,.()/\\<>'.split('');
export const ALL_CHARACTERS = [...UPPERCASE, ...LOWERCASE, ...DIGITS, ...SYMBOLS];

export const CANVAS_SIZE = 500;

export const FONT_UNITS_PER_EM = 1000;
export const FONT_ASCENDER = 800;
export const FONT_DESCENDER = -200;

const CAP_LINE_RATIO = 0.15;
const BASELINE_RATIO = 0.77;

export function canvasToFontX(canvasX: number): number {
  const capY = CANVAS_SIZE * CAP_LINE_RATIO;
  const baseY = CANVAS_SIZE * BASELINE_RATIO;
  const range = baseY - capY;
  return (canvasX / range) * FONT_ASCENDER;
}

export function canvasToFontY(canvasY: number): number {
  const capY = CANVAS_SIZE * CAP_LINE_RATIO;
  const baseY = CANVAS_SIZE * BASELINE_RATIO;
  const range = baseY - capY;
  return FONT_ASCENDER - ((canvasY - capY) / range) * (FONT_ASCENDER - 0);
}
