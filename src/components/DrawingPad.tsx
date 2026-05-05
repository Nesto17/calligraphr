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

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid dots
    ctx.fillStyle = '#E4E4E7';
    for (let x = 20; x < CANVAS_WIDTH; x += 20) {
      for (let y = 20; y < CANVAS_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Guide lines
    const guides: { y: number; color: string; label: string; dashed: boolean }[] = [
      { y: GUIDE_LINES.ascender, color: '#D4714E', label: 'ascender', dashed: true },
      { y: GUIDE_LINES.capHeight, color: '#8B7EC8', label: 'cap', dashed: true },
      { y: GUIDE_LINES.xHeight, color: '#E09D4A', label: 'x-height', dashed: true },
      { y: GUIDE_LINES.baseline, color: '#D4714E', label: 'baseline', dashed: false },
      { y: GUIDE_LINES.descender, color: '#8B7EC8', label: 'descender', dashed: true },
    ];

    for (const guide of guides) {
      ctx.strokeStyle = guide.color + '40';
      ctx.lineWidth = guide.dashed ? 0.75 : 1.25;
      ctx.setLineDash(guide.dashed ? [6, 4] : []);
      ctx.beginPath();
      ctx.moveTo(0, guide.y);
      ctx.lineTo(CANVAS_WIDTH, guide.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = guide.color + '80';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText(guide.label, 6, guide.y - 4);
    }

    // Draw strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
    if (currentPoints.length > 0) {
      drawStroke(ctx, { points: currentPoints, width: penSize });
    }
  }, [strokes, currentPoints, penSize]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length === 0) return;
    ctx.strokeStyle = '#1A1A1A';
    ctx.fillStyle = '#1A1A1A';
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
      const remaining = strokes.filter((stroke) =>
        !stroke.points.some(
          (p) => Math.abs(p.x - pos.x) < threshold && Math.abs(p.y - pos.y) < threshold
        )
      );
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
    setStrokes(undoStack[undoStack.length - 1]);
    setUndoStack(undoStack.slice(0, -1));
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
    <div className="flex flex-col items-center gap-5">
      {/* Character label */}
      <div className="flex items-center gap-4">
        <span className="text-5xl font-accent text-[#D4714E]">{character}</span>
        <span className="text-sm text-[#A1A1AA]">{hint}</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E4E4E7] shadow-sm">
        {PEN_SIZES.map((size) => (
          <button
            key={size.label}
            onClick={() => { setTool('pen'); setPenSize(size.value); }}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
              tool === 'pen' && penSize === size.value
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#71717A] hover:bg-[#F4F4F5]'
            }`}
          >
            {size.label}
          </button>
        ))}

        <div className="w-px h-5 bg-[#E4E4E7] mx-1" />

        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tool === 'eraser'
              ? 'bg-[#D4714E] text-white'
              : 'text-[#71717A] hover:bg-[#F4F4F5]'
          }`}
        >
          Eraser
        </button>

        <div className="w-px h-5 bg-[#E4E4E7] mx-1" />

        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>

        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D4714E] hover:bg-[#D4714E]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl border border-[#E4E4E7] shadow-sm overflow-hidden bg-white">
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

      {/* Save */}
      <button
        onClick={handleSave}
        className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
      >
        Save character
      </button>
    </div>
  );
}
