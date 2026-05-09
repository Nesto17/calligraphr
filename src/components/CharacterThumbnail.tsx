'use client';

import { useRef, useEffect } from 'react';
import { Stroke } from '@/types';
import { CANVAS_SIZE } from '@/lib/constants';

interface CharacterThumbnailProps {
  strokes: Stroke[];
}

export default function CharacterThumbnail({ strokes }: CharacterThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 40;
    ctx.clearRect(0, 0, size, size);

    const scale = size / CANVAS_SIZE;

    ctx.strokeStyle = '#2B2B2B';
    ctx.fillStyle = '#2B2B2B';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of strokes) {
      if (stroke.points.length === 0) continue;
      ctx.lineWidth = Math.max(stroke.width * scale, 1);

      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(
          stroke.points[0].x * scale,
          stroke.points[0].y * scale,
          ctx.lineWidth / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale);
      }
      ctx.stroke();
    }
  }, [strokes]);

  return (
    <canvas
      ref={canvasRef}
      width={40}
      height={40}
      className="w-full h-full"
    />
  );
}
