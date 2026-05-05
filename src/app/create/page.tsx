'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Stroke } from '@/types';
import CharacterGrid from '@/components/CharacterGrid';
import DrawingPad from '@/components/DrawingPad';
import Preview from '@/components/Preview';
import ExportButton from '@/components/ExportButton';

export default function CreatePage() {
  const [fontName, setFontName] = useState('My Doodle Font');
  const [characters, setCharacters] = useState<Map<string, Stroke[]>>(new Map());
  const [activeCharacter, setActiveCharacter] = useState<string | null>('A');

  const handleSave = useCallback(
    (strokes: Stroke[]) => {
      if (!activeCharacter) return;
      setCharacters((prev) => {
        const next = new Map(prev);
        next.set(activeCharacter, strokes);
        return next;
      });

      const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
      const currentIndex = allChars.indexOf(activeCharacter);
      for (let i = 1; i < allChars.length; i++) {
        const nextIndex = (currentIndex + i) % allChars.length;
        const nextChar = allChars[nextIndex];
        const nextCharStrokes = characters.get(nextChar);
        if (!nextCharStrokes || nextCharStrokes.length === 0) {
          setActiveCharacter(nextChar);
          return;
        }
      }
    },
    [activeCharacter, characters]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E4E4E7] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-accent text-[#1A1A1A] hover:text-[#D4714E] transition-colors">
            Calligraphr
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#71717A]">Font name</label>
              <input
                type="text"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white text-sm text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4714E]/30 focus:border-[#D4714E] w-48 transition-all"
              />
            </div>
            <ExportButton fontName={fontName} characters={characters} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-[280px_1fr] gap-10">
          <aside>
            <CharacterGrid
              characters={characters}
              activeCharacter={activeCharacter}
              onSelect={setActiveCharacter}
            />
          </aside>

          <div className="space-y-10">
            {activeCharacter ? (
              <DrawingPad
                character={activeCharacter}
                initialStrokes={characters.get(activeCharacter) || []}
                onSave={handleSave}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] rounded-2xl border border-dashed border-[#E4E4E7] bg-white">
                <p className="text-[#A1A1AA]">
                  Select a character to start drawing
                </p>
              </div>
            )}

            <Preview fontName={fontName} characters={characters} />
          </div>
        </div>
      </div>
    </div>
  );
}
