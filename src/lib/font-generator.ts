import opentype, { Path, Glyph, Font } from 'opentype.js';
import { Stroke } from '@/types';
import { strokeToOutline } from './stroke-to-outline';
import {
  FONT_UNITS_PER_EM,
  FONT_ASCENDER,
  FONT_DESCENDER,
  canvasToFontX,
  canvasToFontY,
} from './constants';

function strokesToGlyphPath(strokes: Stroke[], xOffset: number): Path {
  const path = new opentype.Path();

  for (const stroke of strokes) {
    const outline = strokeToOutline(stroke);
    if (outline.length === 0) continue;

    const fontPoints = outline.map((p) => ({
      x: Math.round(canvasToFontX(p.x) - xOffset),
      y: Math.round(canvasToFontY(p.y)),
    }));

    path.moveTo(fontPoints[0].x, fontPoints[0].y);
    for (let i = 1; i < fontPoints.length; i++) {
      path.lineTo(fontPoints[i].x, fontPoints[i].y);
    }
    path.close();
  }

  return path;
}

const SIDE_BEARING = 20;

function computeGlyphMetrics(strokes: Stroke[]): { xOffset: number; advanceWidth: number } {
  if (strokes.length === 0) return { xOffset: 0, advanceWidth: 500 };

  let minX = Infinity;
  let maxX = -Infinity;

  for (const stroke of strokes) {
    const fontHalfW = canvasToFontX(stroke.width / 2);
    for (const p of stroke.points) {
      const fx = canvasToFontX(p.x);
      if (fx - fontHalfW < minX) minX = fx - fontHalfW;
      if (fx + fontHalfW > maxX) maxX = fx + fontHalfW;
    }
  }

  return {
    xOffset: minX - SIDE_BEARING,
    advanceWidth: Math.max(Math.round(maxX - minX + SIDE_BEARING * 2), 200),
  };
}

export function generateFont(
  fontName: string,
  characters: Map<string, Stroke[]>
): ArrayBuffer {
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, 700);
  notdefPath.lineTo(500, 700);
  notdefPath.lineTo(500, 0);
  notdefPath.close();
  notdefPath.moveTo(150, 50);
  notdefPath.lineTo(450, 50);
  notdefPath.lineTo(450, 650);
  notdefPath.lineTo(150, 650);
  notdefPath.close();

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 600,
    path: notdefPath,
  });

  const spaceGlyph = new opentype.Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: 300,
    path: new opentype.Path(),
  });

  const glyphs: Glyph[] = [notdefGlyph, spaceGlyph];

  characters.forEach((strokes, char) => {
    if (strokes.length === 0) return;
    const { xOffset, advanceWidth } = computeGlyphMetrics(strokes);
    const path = strokesToGlyphPath(strokes, xOffset);
    const glyph = new opentype.Glyph({
      name: char.length === 1 ? char : `char_${char}`,
      unicode: char.charCodeAt(0),
      advanceWidth,
      path,
    });
    glyphs.push(glyph);
  });

  const font = new opentype.Font({
    familyName: fontName || 'My Doodle Font',
    styleName: 'Regular',
    unitsPerEm: FONT_UNITS_PER_EM,
    ascender: FONT_ASCENDER,
    descender: FONT_DESCENDER,
    glyphs,
  });

  return font.toArrayBuffer();
}
