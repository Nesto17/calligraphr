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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1A1A1A]">Preview</h2>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={24}
            max={96}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20 accent-[#D4714E]"
          />
          <span className="text-xs text-[#A1A1AA] tabular-nums w-6">{fontSize}</span>
        </div>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to preview..."
        className="w-full px-4 py-2.5 rounded-xl border border-[#E4E4E7] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D4714E]/20 focus:border-[#D4714E] transition-all placeholder:text-[#D4D4D8]"
      />

      <div
        className="bg-white rounded-2xl border border-[#E4E4E7] shadow-sm p-8 min-h-[120px] flex items-center justify-center"
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
          <span className="text-[#D4D4D8] text-base font-sans">
            Draw some characters to see a preview
          </span>
        )}
      </div>
    </div>
  );
}
