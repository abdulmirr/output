'use client';

import { motion } from 'motion/react';

interface TourSpotlightProps {
  rect: { x: number; y: number; width: number; height: number } | null;
  padding?: number;
  radius?: number;
}

export function TourSpotlight({ rect, padding = 8, radius = 12 }: TourSpotlightProps) {
  if (!rect) return null;

  const x = rect.x - padding;
  const y = rect.y - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  return (
    <>
      {/* Visual mask */}
      <svg
        className="pointer-events-none fixed inset-0 z-[60] h-screen w-screen"
        aria-hidden
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              initial={false}
              animate={{ x, y, width: w, height: h }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              rx={radius}
              ry={radius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.28)"
          mask="url(#tour-spotlight-mask)"
        />
        {/* thin highlight ring */}
        <motion.rect
          initial={false}
          animate={{ x: x - 0.5, y: y - 0.5, width: w + 1, height: h + 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          rx={radius + 0.5}
          ry={radius + 0.5}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1}
        />
      </svg>

      {/* Click blockers (4 frame pieces) — consume clicks outside the target */}
      <ClickBlockers x={x} y={y} w={w} h={h} />
    </>
  );
}

function ClickBlockers({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  // top, left, right, bottom
  const base = 'fixed z-[59] bg-transparent';
  return (
    <>
      <div className={base} style={{ top: 0, left: 0, right: 0, height: Math.max(0, y) }} />
      <div className={base} style={{ top: y, left: 0, width: Math.max(0, x), height: h }} />
      <div className={base} style={{ top: y, left: x + w, right: 0, height: h }} />
      <div className={base} style={{ top: y + h, left: 0, right: 0, bottom: 0 }} />
    </>
  );
}
