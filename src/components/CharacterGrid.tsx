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
  dotColor,
}: {
  title: string;
  chars: string[];
  characters: Map<string, Stroke[]>;
  activeCharacter: string | null;
  onSelect: (char: string) => void;
  dotColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
        <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {chars.map((char) => {
          const hasDrawing = (characters.get(char)?.length ?? 0) > 0;
          const isActive = activeCharacter === char;
          return (
            <button
              key={char}
              onClick={() => onSelect(char)}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : hasDrawing
                    ? 'bg-white border border-[#E4E4E7] text-[#1A1A1A] hover:border-[#D4714E]/40'
                    : 'bg-transparent text-[#A1A1AA] hover:bg-white hover:text-[#71717A] border border-transparent hover:border-[#E4E4E7]'
              }`}
            >
              {hasDrawing ? (
                <CharacterThumbnail strokes={characters.get(char)!} />
              ) : (
                char
              )}
              {hasDrawing && !isActive && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor: dotColor }}
                />
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1A1A1A]">Characters</h2>
        <span className="text-xs text-[#A1A1AA] tabular-nums">
          {totalDrawn}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D4714E] rounded-full transition-all duration-300"
          style={{ width: `${(totalDrawn / total) * 100}%` }}
        />
      </div>

      <div className="space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
        <CharacterSection
          title="Uppercase"
          chars={UPPERCASE}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          dotColor="#D4714E"
        />
        <CharacterSection
          title="Lowercase"
          chars={LOWERCASE}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          dotColor="#8B7EC8"
        />
        <CharacterSection
          title="Numbers"
          chars={DIGITS}
          characters={characters}
          activeCharacter={activeCharacter}
          onSelect={onSelect}
          dotColor="#E09D4A"
        />
      </div>
    </div>
  );
}
