# Doodle Font Maker

Turn your handwriting into a real, installable font — right from your browser.

Draw each character on a guided canvas, preview your font in real time, and export a `.otf` file you can install in Font Book and use in Google Docs, Microsoft Word, Photoshop, or any app that supports custom fonts.

## Features

- **Guided Drawing Pad** — Draw each character (A-Z, a-z, 0-9) on a canvas with handwriting guide lines: ascender, cap height, x-height, baseline, and descender. Notebook-paper styling keeps things fun.
- **Pen Tools** — Three pen sizes (S, M, L), an eraser to remove strokes, undo, and clear.
- **Live Preview** — Type any sentence and see it rendered in your drawn font instantly. Adjustable font size.
- **Auto-Advance** — After saving a character, the app automatically moves to the next undrawn one so you can flow through the alphabet.
- **Export .otf** — Download a real OpenType font file. Double-click it to install via Font Book and use it everywhere.
- **Fully Client-Side** — No server, no uploads. Everything runs in your browser using [opentype.js](https://opentype.js.org/).

## Getting Started

### Prerequisites

- Node.js >= 20.9.0 (use `nvm use` if you have [nvm](https://github.com/nvm-sh/nvm) — there's an `.nvmrc` included)

### Install & Run

```bash
git clone https://github.com/Nesto17/calligraphr.git
cd calligraphr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Click **Start Creating!** on the landing page.
2. Give your font a name in the header.
3. Click a character from the grid on the left.
4. Draw the character on the canvas. Use the guide lines to keep your letters aligned.
5. Click **Save Character** — the app advances to the next undrawn character.
6. Repeat until you've drawn all the characters you want.
7. Check the **Preview** section at the bottom to see your font in action.
8. Click **Download Font (.otf)** to export your font.
9. Double-click the `.otf` file to install it via Font Book (macOS).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Font Generation | opentype.js |
| Font | Patrick Hand (via next/font) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Main font creation page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles & doodly theme
├── components/
│   ├── DrawingPad.tsx        # Canvas with pen tools & guide lines
│   ├── CharacterGrid.tsx     # A-Z, a-z, 0-9 selection grid
│   ├── CharacterThumbnail.tsx# Miniature preview in grid cells
│   ├── Preview.tsx           # Live font preview
│   └── ExportButton.tsx      # .otf download
├── lib/
│   ├── constants.ts          # Font metrics, canvas config
│   ├── font-generator.ts     # opentype.js font creation
│   └── stroke-to-outline.ts  # Stroke → vector outline conversion
└── types/
    ├── index.ts              # App types
    └── opentype.d.ts         # opentype.js type declarations
```

## License

MIT
