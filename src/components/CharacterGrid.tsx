'use client';

import { Stroke } from '@/types';
import { UPPERCASE, LOWERCASE, DIGITS, SYMBOLS } from '@/lib/constants';

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
}: {
  title: string;
  chars: string[];
  characters: Map<string, Stroke[]>;
  activeCharacter: string | null;
  onSelect: (char: string) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
        {title}
      </h3>
      <div className="grid grid-cols-9 gap-1">
        {chars.map((char) => {
          const hasDrawing = (characters.get(char)?.length ?? 0) > 0;
          const isActive = activeCharacter === char;
          return (
            <button
              key={char}
              onClick={() => onSelect(char)}
              className={`aspect-square rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-[#1A1A1A] text-white'
                  : hasDrawing
                    ? 'bg-[#D4714E] text-white'
                    : 'text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#71717A] active:bg-[#EBEBEB] active:text-[#52525B]'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CharacterGrid({ characters, activeCharacter, onSelect }: CharacterGridProps) {
  const totalDrawn = Array.from(characters.values()).filter((s) => s.length > 0).length;
  const total = UPPERCASE.length + LOWERCASE.length + DIGITS.length + SYMBOLS.length;

  return (
    <div className="space-y-4 p-4 md:p-0 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Characters</h2>
        <span className="text-sm text-[#A1A1AA] tabular-nums">
          {totalDrawn}/{total}
        </span>
      </div>

      <div className="h-1 bg-[#F4F4F5] rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-[#D4714E] rounded-full transition-all duration-300"
          style={{ width: `${(totalDrawn / total) * 100}%` }}
        />
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-0">
        <CharacterSection title="Uppercase" chars={UPPERCASE} characters={characters} activeCharacter={activeCharacter} onSelect={onSelect} />
        <CharacterSection title="Lowercase" chars={LOWERCASE} characters={characters} activeCharacter={activeCharacter} onSelect={onSelect} />
        <CharacterSection title="Numbers" chars={DIGITS} characters={characters} activeCharacter={activeCharacter} onSelect={onSelect} />
        <CharacterSection title="Symbols" chars={SYMBOLS} characters={characters} activeCharacter={activeCharacter} onSelect={onSelect} />
      </div>
    </div>
  );
}
