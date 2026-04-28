'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Point, Stroke } from '@/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GUIDE_LINES } from '@/lib/constants';

interface DrawingPadProps {
  character: string;
  initialStrokes: Stroke[];
  onSave: (strokes: Stroke[]) => void;
}

const PEN_SIZES = [
  { label: 'S', value: 6 },
  { label: 'M', value: 12 },
  { label: 'L', value: 20 },
];

export default function DrawingPad({ character, initialStrokes, onSave }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(12);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);

  useEffect(() => {
    setStrokes(initialStrokes);
    setUndoStack([]);
  }, [character, initialStrokes]);

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw notebook paper background
    ctx.fillStyle = '#FFF8F0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Horizontal ruled lines (faint)
    for (let y = GUIDE_LINES.ascender; y <= GUIDE_LINES.descender; y += 20) {
      ctx.strokeStyle = '#E8DDD0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Guide lines
    const guides = [
      { y: GUIDE_LINES.ascender, color: '#457B9D', label: 'ascender', dash: [6, 4] },
      { y: GUIDE_LINES.capHeight, color: '#E63946', label: 'cap', dash: [6, 4] },
      { y: GUIDE_LINES.xHeight, color: '#F4A261', label: 'x-height', dash: [4, 4] },
      { y: GUIDE_LINES.baseline, color: '#E63946', label: 'baseline', dash: [] as number[] },
      { y: GUIDE_LINES.descender, color: '#457B9D', label: 'descender', dash: [6, 4] },
    ];

    for (const guide of guides) {
      ctx.strokeStyle = guide.color;
      ctx.lineWidth = guide.dash.length ? 1 : 1.5;
      ctx.setLineDash(guide.dash);
      ctx.beginPath();
      ctx.moveTo(0, guide.y);
      ctx.lineTo(CANVAS_WIDTH, guide.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = guide.color;
      ctx.font = '10px sans-serif';
      ctx.fillText(guide.label, 4, guide.y - 4);
    }

    // Draw left margin line
    ctx.strokeStyle = '#E6939A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }

    // Draw current stroke
    if (currentPoints.length > 0) {
      drawStroke(ctx, { points: currentPoints, width: penSize });
    }
  }, [strokes, currentPoints, penSize]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length === 0) return;
    ctx.strokeStyle = '#2B2B2B';
    ctx.fillStyle = '#2B2B2B';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.width;

    if (stroke.points.length === 1) {
      ctx.beginPath();
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }

  function getCanvasPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const pos = getCanvasPos(e);

    if (tool === 'eraser') {
      const threshold = 20;
      const remaining = strokes.filter((stroke) => {
        return !stroke.points.some(
          (p) => Math.abs(p.x - pos.x) < threshold && Math.abs(p.y - pos.y) < threshold
        );
      });
      if (remaining.length !== strokes.length) {
        setUndoStack([...undoStack, strokes]);
        setStrokes(remaining);
      }
      return;
    }

    setIsDrawing(true);
    setCurrentPoints([pos]);
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing || tool === 'eraser') return;
    const pos = getCanvasPos(e);
    const last = currentPoints[currentPoints.length - 1];
    if (last && Math.abs(pos.x - last.x) < 2 && Math.abs(pos.y - last.y) < 2) return;
    setCurrentPoints([...currentPoints, pos]);
  }

  function handlePointerUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 0) {
      const newStroke: Stroke = { points: currentPoints, width: penSize };
      setUndoStack([...undoStack, strokes]);
      setStrokes([...strokes, newStroke]);
      setCurrentPoints([]);
    }
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setStrokes(prev);
  }

  function handleClear() {
    if (strokes.length === 0) return;
    setUndoStack([...undoStack, strokes]);
    setStrokes([]);
  }

  function handleSave() {
    onSave(strokes);
  }

  const isUpperCase = character === character.toUpperCase() && /[A-Z]/.test(character);
  const isDigit = /[0-9]/.test(character);
  const hint = isUpperCase || isDigit
    ? 'Draw between the cap line and baseline'
    : 'Draw between the x-height and baseline';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="inline-block bg-[#E63946] text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg transform -rotate-1">
          Draw: <span className="text-4xl">{character}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2 font-hand">{hint}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full shadow-md border-2 border-dashed border-[#457B9D]">
        <div className="flex gap-1">
          {PEN_SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => { setTool('pen'); setPenSize(size.value); }}
              className={`w-9 h-9 rounded-full border-2 font-bold text-sm transition-all ${
                tool === 'pen' && penSize === size.value
                  ? 'bg-[#457B9D] text-white border-[#457B9D] scale-110'
                  : 'bg-white text-[#457B9D] border-[#457B9D] hover:bg-[#457B9D]/10'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1.5 rounded-full border-2 font-bold text-sm transition-all ${
            tool === 'eraser'
              ? 'bg-[#F4A261] text-white border-[#F4A261] scale-105'
              : 'bg-white text-[#F4A261] border-[#F4A261] hover:bg-[#F4A261]/10'
          }`}
        >
          Eraser
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="px-3 py-1.5 rounded-full border-2 border-gray-400 text-gray-600 font-bold text-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Undo
        </button>

        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-full border-2 border-[#E63946] text-[#E63946] font-bold text-sm hover:bg-[#E63946]/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="relative border-3 border-[#2B2B2B] rounded-lg shadow-[4px_4px_0px_#2B2B2B] bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="cursor-crosshair touch-none"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="bg-[#457B9D] text-white px-8 py-3 rounded-full text-lg font-bold shadow-[3px_3px_0px_#2B2B2B] border-2 border-[#2B2B2B] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#2B2B2B] transition-all active:translate-y-[3px] active:shadow-none"
      >
        Save Character
      </button>
    </div>
  );
}
