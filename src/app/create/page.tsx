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

      // Auto-advance to the next undrawn character
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
    <div className="min-h-screen notebook-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FFF5E6]/95 backdrop-blur-sm border-b-2 border-dashed border-[#D4C4B0] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold">
              <span className="text-[#E63946]">D</span>
              <span className="text-[#457B9D]">F</span>
              <span className="text-[#F4A261]">M</span>
            </span>
            <span className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
              ← back
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Font name:</label>
            <input
              type="text"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              className="px-4 py-1.5 rounded-full border-2 border-[#457B9D] bg-white text-[#2B2B2B] font-bold focus:outline-none focus:ring-2 focus:ring-[#E63946] w-56"
            />
          </div>

          <ExportButton fontName={fontName} characters={characters} />
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-[320px_1fr] gap-8">
          {/* Left: Character Grid */}
          <aside>
            <CharacterGrid
              characters={characters}
              activeCharacter={activeCharacter}
              onSelect={setActiveCharacter}
            />
          </aside>

          {/* Right: Drawing pad + Preview */}
          <div className="space-y-8">
            {activeCharacter ? (
              <DrawingPad
                character={activeCharacter}
                initialStrokes={characters.get(activeCharacter) || []}
                onSave={handleSave}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] doodle-border bg-white/50">
                <p className="text-xl text-gray-400">
                  Select a character from the grid to start drawing
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
