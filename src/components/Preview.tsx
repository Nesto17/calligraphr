'use client';

import { useState, useEffect, useRef } from 'react';
import { Stroke } from '@/types';
import { generateFont } from '@/lib/font-generator';

interface PreviewProps {
  fontName: string;
  characters: Map<string, Stroke[]>;
}

export default function Preview({ fontName, characters }: PreviewProps) {
  const [text, setText] = useState('Hello World');
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(48);
  const fontFaceRef = useRef<FontFace | null>(null);

  useEffect(() => {
    const drawnCount = Array.from(characters.values()).filter((s) => s.length > 0).length;
    if (drawnCount === 0) {
      setFontUrl(null);
      return;
    }

    try {
      const buffer = generateFont(fontName, characters);
      const blob = new Blob([buffer], { type: 'font/opentype' });
      const url = URL.createObjectURL(blob);

      if (fontFaceRef.current) {
        document.fonts.delete(fontFaceRef.current);
      }

      const face = new FontFace('DoodlePreview', `url(${url})`);
      face.load().then(() => {
        document.fonts.add(face);
        fontFaceRef.current = face;
        setFontUrl(url);
      });

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch {
      // Font generation can fail if not enough chars drawn yet
    }
  }, [fontName, characters]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2B2B2B] font-hand">Preview</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Size:</label>
          <input
            type="range"
            min={24}
            max={96}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-24 accent-[#E63946]"
          />
          <span className="text-sm font-bold text-[#457B9D] w-8">{fontSize}</span>
        </div>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to preview..."
        className="w-full px-4 py-2 rounded-full border-2 border-dashed border-[#F4A261] bg-white focus:outline-none focus:border-solid focus:border-[#E63946] text-[#2B2B2B] font-hand"
      />

      <div
        className="bg-white rounded-lg border-2 border-[#2B2B2B] shadow-[3px_3px_0px_#2B2B2B] p-6 min-h-[120px] flex items-center justify-center"
        style={{
          fontFamily: fontUrl ? 'DoodlePreview, sans-serif' : 'sans-serif',
          fontSize: `${fontSize}px`,
          lineHeight: 1.4,
          color: '#2B2B2B',
          wordBreak: 'break-word',
        }}
      >
        {fontUrl ? (
          text || 'Type something above...'
        ) : (
          <span className="text-gray-400 font-hand text-lg">
            Draw some characters to see a preview!
          </span>
        )}
      </div>
    </div>
  );
}
