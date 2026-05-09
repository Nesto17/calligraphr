'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Stroke } from '@/types';
import { ALL_CHARACTERS } from '@/lib/constants';
import CharacterGrid from '@/components/CharacterGrid';
import DrawingPad from '@/components/DrawingPad';
import Preview from '@/components/Preview';
import ExportButton from '@/components/ExportButton';

export default function CreatePage() {
  const [fontName, setFontName] = useState('My Doodle Font');
  const [characters, setCharacters] = useState<Map<string, Stroke[]>>(new Map());
  const [activeCharacter, setActiveCharacter] = useState<string | null>('A');
  const [activePanel, setActivePanel] = useState<'draw' | 'preview'>('draw');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (ALL_CHARACTERS.includes(e.key)) {
        setActiveCharacter(e.key);
        setActivePanel('draw');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = useCallback(
    (strokes: Stroke[]) => {
      if (!activeCharacter) return;
      setCharacters((prev) => {
        const next = new Map(prev);
        next.set(activeCharacter, strokes);
        return next;
      });

      const allChars = ALL_CHARACTERS;
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
    <div className="h-screen flex flex-col bg-[#FAFAF8] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-[#E4E4E7] px-3 sm:px-6 py-2 sm:py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg hover:opacity-70 transition-opacity" title="Home">
            ✏️
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#71717A] hidden sm:inline">Font name</label>
              <input
                type="text"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
                placeholder="Font name"
                className="px-2 sm:px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white text-sm text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4714E]/30 focus:border-[#D4714E] w-28 sm:w-48 transition-all"
              />
            </div>
            <ExportButton fontName={fontName} characters={characters} />
          </div>
        </div>
      </header>

      {/* Desktop: 3-column layout */}
      <div className="hidden lg:grid flex-1 min-h-0 max-w-[1400px] mx-auto w-full grid-cols-[220px_1fr_280px] gap-6 px-6 py-6 items-start">
        <aside className="min-h-0 overflow-hidden">
          <CharacterGrid
            characters={characters}
            activeCharacter={activeCharacter}
            onSelect={setActiveCharacter}
          />
        </aside>

        <div className="min-h-0 pt-1">
          {activeCharacter ? (
            <DrawingPad
              character={activeCharacter}
              initialStrokes={characters.get(activeCharacter) || []}
              onSave={handleSave}
            />
          ) : (
            <div className="flex items-start justify-center h-full rounded-2xl border border-dashed border-[#E4E4E7] bg-white">
              <p className="text-[#A1A1AA] text-sm">
                Select a character to start drawing
              </p>
            </div>
          )}
        </div>

        <div className="min-h-0">
          <Preview fontName={fontName} characters={characters} />
        </div>
      </div>

      {/* Mobile/Tablet: stacked layout */}
      <div className={`lg:hidden flex-1 min-h-0 flex flex-col ${activePanel === 'draw' ? '' : 'hidden'}`}>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-xl mx-auto w-full px-3 md:px-6 pt-3">
            {activeCharacter ? (
              <DrawingPad
                character={activeCharacter}
                initialStrokes={characters.get(activeCharacter) || []}
                onSave={handleSave}
              />
            ) : (
              <div className="flex items-start justify-center h-40 rounded-2xl border border-dashed border-[#E4E4E7] bg-white">
                <p className="text-[#A1A1AA] text-sm pt-6">
                  Select a character to start drawing
                </p>
              </div>
            )}
          </div>

          <div className="max-w-xl mx-auto w-full px-3 md:px-6 pt-4 pb-4">
            <CharacterGrid
              characters={characters}
              activeCharacter={activeCharacter}
              onSelect={setActiveCharacter}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: preview panel */}
      <div className={`lg:hidden flex-1 min-h-0 ${activePanel === 'preview' ? 'block' : 'hidden'}`}>
        <div className="h-full max-w-xl mx-auto w-full">
          <Preview fontName={fontName} characters={characters} />
        </div>
      </div>

      {/* Tablet preview toggle (md only, when on draw panel) */}
      {activePanel === 'draw' && (
        <button
          onClick={() => setShowPreview(true)}
          className="hidden md:flex lg:hidden fixed right-4 bottom-4 z-40 bg-[#D4714E] hover:bg-[#C4623F] active:bg-[#B5573A] active:scale-95 text-white w-11 h-11 rounded-full items-center justify-center shadow-lg transition-colors"
          title="Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      )}

      {/* Tablet preview drawer */}
      {showPreview && (
        <div className="hidden md:block lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowPreview(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#FAFAF8] border-l border-[#E4E4E7] p-4 shadow-xl flex flex-col">
            <button onClick={() => setShowPreview(false)} className="mb-3 text-sm text-[#71717A] hover:text-[#1A1A1A] active:text-[#1A1A1A] self-end transition-colors">
              Close
            </button>
            <div className="flex-1 min-h-0">
              <Preview fontName={fontName} characters={characters} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden shrink-0 border-t border-[#E4E4E7] bg-white px-2 py-1.5 flex justify-around safe-area-bottom">
        <button
          onClick={() => setActivePanel('draw')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-xs font-medium transition-colors active:scale-95 ${
            activePanel === 'draw' ? 'text-[#D4714E]' : 'text-[#71717A] active:text-[#52525B]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          <span>Draw</span>
        </button>
        <button
          onClick={() => setActivePanel('preview')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-xs font-medium transition-colors active:scale-95 ${
            activePanel === 'preview' ? 'text-[#D4714E]' : 'text-[#71717A] active:text-[#52525B]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Preview</span>
        </button>
      </nav>
    </div>
  );
}
