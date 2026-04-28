declare module 'opentype.js' {
  export class Path {
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
    close(): void;
    closePath(): void;
  }

  export class Glyph {
    constructor(options: {
      name: string;
      unicode: number;
      advanceWidth: number;
      path: Path;
    });
  }

  export class Font {
    constructor(options: {
      familyName: string;
      styleName: string;
      unitsPerEm: number;
      ascender: number;
      descender: number;
      glyphs: Glyph[];
    });
    toArrayBuffer(): ArrayBuffer;
    download(): void;
  }

  const opentype: {
    Path: typeof Path;
    Glyph: typeof Glyph;
    Font: typeof Font;
  };

  export default opentype;
}
