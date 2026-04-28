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
      className="bg-[#E63946] text-white px-8 py-4 rounded-full text-xl font-bold shadow-[4px_4px_0px_#2B2B2B] border-3 border-[#2B2B2B] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#2B2B2B] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#2B2B2B]"
    >
      Download Font (.otf)
    </button>
  );
}
