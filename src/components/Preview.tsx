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
    <div className="flex flex-col h-full p-4 md:p-0">
      <div className="flex items-center justify-between pb-3 shrink-0">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Preview</h2>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={20}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 accent-[#D4714E] h-1"
          />
          <span className="text-sm text-[#A1A1AA] tabular-nums w-5">{fontSize}</span>
        </div>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type to preview..."
        className="w-full px-3 py-2 rounded-lg border border-[#E4E4E7] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4714E]/20 focus:border-[#D4714E] transition-all placeholder:text-[#D4D4D8] mb-3 shrink-0"
      />

      <div
        className="bg-white rounded-2xl border border-[#E4E4E7] shadow-sm p-6 flex items-center justify-center overflow-auto min-h-[200px] md:min-h-0 flex-1"
        style={{
          fontFamily: fontUrl ? 'DoodlePreview, sans-serif' : 'sans-serif',
          fontSize: `${fontSize}px`,
          lineHeight: 1.4,
          color: '#1A1A1A',
          wordBreak: 'break-word',
        }}
      >
        {fontUrl ? (
          text || 'Type something above...'
        ) : (
          <span className="text-[#D4D4D8] text-sm font-sans">
            Draw some characters to see a preview
          </span>
        )}
      </div>
    </div>
  );
}
