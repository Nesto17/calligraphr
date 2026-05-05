'use client';

import { Stroke } from '@/types';
import { generateFont } from '@/lib/font-generator';

interface ExportButtonProps {
  fontName: string;
  characters: Map<string, Stroke[]>;
}

export default function ExportButton({ fontName, characters }: ExportButtonProps) {
  const drawnCount = Array.from(characters.values()).filter((s) => s.length > 0).length;

  function handleExport() {
    const buffer = generateFont(fontName, characters);
    const blob = new Blob([buffer], { type: 'font/opentype' });
    const url = URL.createObjectURL(blob);

    const safeName = (fontName || 'my-doodle-font').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.otf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={drawnCount === 0}
      className="bg-[#D4714E] hover:bg-[#C4623F] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#D4714E]"
    >
      Download .otf
    </button>
  );
}
