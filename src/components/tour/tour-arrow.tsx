'use client';

import { motion } from 'motion/react';

interface Point {
  x: number;
  y: number;
}

interface TourArrowProps {
  from: Point;
  to: Point;
}

/**
 * Hand-drawn style arrow from card anchor to target.
 * Uses a cubic bezier with a curvature offset perpendicular to the line.
 */
export function TourArrow({ from, to }: TourArrowProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 12) return null;

  // perpendicular unit vector for curve offset
  const nx = -dy / len;
  const ny = dx / len;
  const curve = Math.min(80, len * 0.3);

  const c1 = {
    x: from.x + dx * 0.25 + nx * curve,
    y: from.y + dy * 0.25 + ny * curve,
  };
  const c2 = {
    x: from.x + dx * 0.75 + nx * curve * 0.6,
    y: from.y + dy * 0.75 + ny * curve * 0.6,
  };

  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;

  // arrowhead — pointing toward target along tangent at the end
  const tx = to.x - c2.x;
  const ty = to.y - c2.y;
  const tlen = Math.hypot(tx, ty) || 1;
  const ux = tx / tlen;
  const uy = ty / tlen;
  const headLen = 10;
  const headWidth = 6;
  const headBase = { x: to.x - ux * headLen, y: to.y - uy * headLen };
  const head1 = { x: headBase.x + -uy * headWidth, y: headBase.y + ux * headWidth };
  const head2 = { x: headBase.x - -uy * headWidth, y: headBase.y - ux * headWidth };
  const headPath = `M ${to.x} ${to.y} L ${head1.x} ${head1.y} M ${to.x} ${to.y} L ${head2.x} ${head2.y}`;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[61] h-screen w-screen"
      aria-hidden
    >
      <motion.path
        key={d}
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="text-foreground/70"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.4, ease: 'easeOut' }, opacity: { duration: 0.15 } }}
      />
      <motion.path
        key={headPath}
        d={headPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="text-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.15 }}
      />
    </svg>
  );
}
