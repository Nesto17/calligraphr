'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Point, Stroke } from '@/types';

interface DrawingPadProps {
    character: string;
    initialStrokes: Stroke[];
    onSave: (strokes: Stroke[]) => void;
}

const CANVAS_INTERNAL = 500;
const CAP_LINE_RATIO = 0.15;
const BASELINE_RATIO = 0.77;

export default function DrawingPad({ character, initialStrokes, onSave }: DrawingPadProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState(400);
    const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penSize, setPenSize] = useState(30);
    const [undoStack, setUndoStack] = useState<Stroke[][]>([]);

    useEffect(() => {
        setStrokes(initialStrokes);
        setUndoStack([]);
    }, [character, initialStrokes]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(() => {
            const el = containerRef.current;
            if (!el) return;
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setCanvasSize(Math.min(w - 16, h, 420));
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const drawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const S = CANVAS_INTERNAL;
        ctx.clearRect(0, 0, S, S);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, S, S);

        ctx.fillStyle = '#DCDCDC';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const targetHeight = S * (BASELINE_RATIO - CAP_LINE_RATIO);
        const testSize = 200;
        ctx.font = `bold ${testSize}px "Courier New", monospace`;
        const refMetrics = ctx.measureText('H');
        const refHeight = refMetrics.actualBoundingBoxAscent;
        const scaledSize = (targetHeight / refHeight) * testSize;
        ctx.font = `bold ${scaledSize}px "Courier New", monospace`;
        ctx.fillText(character, S / 2, S * BASELINE_RATIO);

        // Cap line
        const capY = S * CAP_LINE_RATIO;
        ctx.strokeStyle = '#D4D4D8';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, capY);
        ctx.lineTo(S, capY);
        ctx.stroke();

        // Baseline
        const baseY = S * BASELINE_RATIO;
        ctx.strokeStyle = '#D4D4D8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(S, baseY);
        ctx.stroke();

        for (const stroke of strokes) {
            drawStroke(ctx, stroke);
        }
        if (currentPoints.length > 0) {
            drawStroke(ctx, { points: currentPoints, width: penSize });
        }
    }, [strokes, currentPoints, penSize, character]);

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
        const scale = CANVAS_INTERNAL / rect.width;

        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scale,
                y: (touch.clientY - rect.top) * scale,
            };
        }
        return {
            x: (e.clientX - rect.left) * scale,
            y: (e.clientY - rect.top) * scale,
        };
    }

    function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
        e.preventDefault();
        const pos = getCanvasPos(e);

        setIsDrawing(true);
        setCurrentPoints([pos]);
    }

    function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
        e.preventDefault();
        if (!isDrawing) return;
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

    return (
        <div className="flex flex-col h-full px-3 md:px-0">
            {/* Canvas area */}
            <div ref={containerRef} className="flex-1 flex items-start justify-center min-h-0">
                <div>
                    {/* Toolbar */}
                    <div className="flex items-center gap-3 pb-2 shrink-0" style={{ width: canvasSize }}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm text-[#A1A1AA] shrink-0">{penSize}px</span>
                            <input
                                type="range"
                                min={20}
                                max={50}
                                value={penSize}
                                onChange={(e) => setPenSize(Number(e.target.value))}
                                className="w-full max-w-[120px] accent-[#1A1A1A] h-1"
                            />
                        </div>

                        <div className="flex items-center gap-1 ml-auto">
                            <button
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                                className="px-2.5 py-1 rounded-lg text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5] active:bg-[#EBEBEB] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Undo
                            </button>

                            <button
                                onClick={handleClear}
                                disabled={strokes.length === 0}
                                className="px-2.5 py-1 rounded-lg text-sm font-medium text-[#D4714E] hover:bg-[#D4714E]/5 active:bg-[#D4714E]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#E4E4E7] shadow-sm overflow-hidden bg-white">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_INTERNAL}
                        height={CANVAS_INTERNAL}
                        className="cursor-default pointer-fine:cursor-crosshair touch-none"
                        style={{ width: canvasSize, height: canvasSize }}
                        onMouseDown={handlePointerDown}
                        onMouseMove={handlePointerMove}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                        onTouchStart={handlePointerDown}
                        onTouchMove={handlePointerMove}
                        onTouchEnd={handlePointerUp}
                    />
                    </div>
                </div>
            </div>

            {/* Save */}
            <div className="pt-2 md:pt-4 pb-2 md:pb-0 flex justify-center shrink-0">
                <button
                    onClick={handleSave}
                    className="bg-[#1A1A1A] hover:bg-[#2A2A2A] active:bg-[#333] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm active:scale-[0.97]"
                >
                    Save character
                </button>
            </div>
        </div>
    );
}
