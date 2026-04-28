'use client';

import { Stroke } from '@/types';
import { UPPERCASE, LOWERCASE, DIGITS } from '@/lib/constants';
import CharacterThumbnail from './CharacterThumbnail';

interface CharacterGridProps {
  characters: Map<string, Stroke[]>;
  activeCharacter: string | null;
  onSelect: (char: string) => void;
}

function CharacterSection({
  title,
  chars,
  characters,
  activeCharacter,
  onSelect,
  color,
}: {
  title: string;
  chars: string[];
  characters: Map<string, Stroke[]>;
  activeCharacter: string | null;
  onSelect: (char: string) => void;
  color: string;
}) {
  return (
    <div>
      <h3
        className="text-sm font-bold mb-2 px-2 py-1 rounded-full inline-block"
        style={{ backgroundColor: color, color: 'white' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-9 gap-1.5">
        {chars.map((char) => {
          const hasDrawing = (characters.get(char)?.length ?? 0) > 0;
          const isActive = activeCharacter === char;
          return (
            <button
              key={char}
              onClick={() => onSelect(char)}
              className={`relative aspect-square rounded-lg border-2 font-bold text-lg transition-all flex items-center justify-center ${
                isActive
                  ? 'border-[#2B2B2B] bg-[#F4A261] text-white scale-105 shadow-[2px_2px_0px_#2B2B2B]'
                  : hasDrawing
                    ? 'border-[#457B9D] bg-[#457B9D]/10 text-[#457B9D] hover:scale-105'
                    : 'border-dashed border-gray-300 text-gray-400 hover:border-[#F4A261] hover:text-[#F4A261] hover:scale-105'
              }`}
            >
              {hasDrawing ? (
                <CharacterThumbnail strokes={characters.get(char)!} />
              ) : (
                char
              )}
              {hasDrawing && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CharacterGrid({ characters, activeCharacter, onSelect }: CharacterGridProps) {
  const totalDrawn = Array.from(characters.values()).filter((s) => s.length > 0).length;
  const total = UPPERCASE.length + LOWERCASE.length + DIGITS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2B2B2B] font-hand">Characters</h2>
        <span className="text-sm bg-white px-3 py-1 rounded-full border-2 border-dashed border-[#457B9D] font-bold text-[#457B9D]">
          {totalDrawn}/{total}
        </span>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin">
        <CharacterSection
          title="UPPERCASE"
          chars={UPPERCASE}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          color="#E63946"
        />
        <CharacterSection
          title="lowercase"
          chars={LOWERCASE}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          color="#457B9D"
        />
        <CharacterSection
          title="Numbers"
          chars={DIGITS}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          color="#F4A261"
        />
      </div>
    </div>
  );
}
