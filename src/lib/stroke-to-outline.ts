import { Point, Stroke } from '@/types';

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function createCircle(center: Point, radius: number, segments = 12): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
}

function simplifyPoints(points: Point[], minDistance: number): Point[] {
  if (points.length <= 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (distance(points[i], result[result.length - 1]) >= minDistance) {
      result.push(points[i]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

export function strokeToOutline(stroke: Stroke): Point[] {
  const { points: rawPoints, width } = stroke;
  const halfWidth = width / 2;

  if (rawPoints.length === 0) return [];
  if (rawPoints.length === 1) return createCircle(rawPoints[0], halfWidth);

  const points = simplifyPoints(rawPoints, 2);
  if (points.length === 1) return createCircle(points[0], halfWidth);

  const leftSide: Point[] = [];
  const rightSide: Point[] = [];

  for (let i = 0; i < points.length; i++) {
    let nx: number, ny: number;

    if (i === 0) {
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else if (i === points.length - 1) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else {
      const dx1 = points[i].x - points[i - 1].x;
      const dy1 = points[i].y - points[i - 1].y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
      const dx2 = points[i + 1].x - points[i].x;
      const dy2 = points[i + 1].y - points[i].y;
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

      nx = -(dy1 / len1 + dy2 / len2) / 2;
      ny = (dx1 / len1 + dx2 / len2) / 2;
      const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nlen;
      ny /= nlen;
    }

    leftSide.push({
      x: points[i].x + nx * halfWidth,
      y: points[i].y + ny * halfWidth,
    });
    rightSide.push({
      x: points[i].x - nx * halfWidth,
      y: points[i].y - ny * halfWidth,
    });
  }

  // Add rounded end caps
  const startCap = createRoundCap(points[0], rightSide[0], leftSide[0], 6);
  const endCap = createRoundCap(
    points[points.length - 1],
    leftSide[leftSide.length - 1],
    rightSide[rightSide.length - 1],
    6
  );

  return [...leftSide, ...endCap, ...rightSide.reverse(), ...startCap];
}

function createRoundCap(
  center: Point,
  from: Point,
  to: Point,
  segments: number
): Point[] {
  const startAngle = Math.atan2(from.y - center.y, from.x - center.x);
  const endAngle = Math.atan2(to.y - center.y, to.x - center.x);
  const radius = distance(center, from);

  let angleDiff = endAngle - startAngle;
  if (angleDiff < 0) angleDiff += Math.PI * 2;
  if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

  const points: Point[] = [];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const angle = startAngle + angleDiff * t;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
}
