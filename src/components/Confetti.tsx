import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  '#FF6B9D', '#FF85A1', '#FFD700', '#FFA500',
  '#87CEEB', '#9B59B6', '#2ECC71', '#E74C3C',
  '#F39C12', '#1ABC9C', '#FF69B4', '#FF4500',
];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
  size: number;
  isCircle: boolean;
  drift: number;
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  fromCenter?: boolean;
}

export function Confetti({ active, count = 80, fromCenter = false }: ConfettiProps) {
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: fromCenter ? 40 + (i / count) * 20 : (i / count) * 100,
        color: COLORS[i % COLORS.length],
        rotation: 720 + (i * 37) % 720,
        duration: 2.2 + (i * 0.031) % 2,
        delay: fromCenter ? (i * 0.007) % 0.3 : (i * 0.012) % 0.8,
        size: 6 + (i * 3) % 9,
        isCircle: i % 3 !== 0,
        drift: ((i % 7) - 3) * 40,
      })),
    [count, fromCenter],
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: fromCenter ? '50%' : '-2%',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.isCircle ? '50%' : '2px',
          }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{
            y: fromCenter ? [0, -120, 300] : ['0vh', '110vh'],
            x: piece.drift,
            rotate: piece.rotation,
            opacity: [1, 1, 1, 0],
            scale: fromCenter ? [0, 1.5, 1] : 1,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: fromCenter ? 'easeOut' : 'linear',
          }}
        />
      ))}
    </div>
  );
}
