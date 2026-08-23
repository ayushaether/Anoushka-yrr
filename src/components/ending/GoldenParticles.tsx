import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COUNT = 72;

interface Particle {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

export function GoldenParticles({ active }: { active: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        xPct: 15 + ((i * 47.3) % 70),
        yPct: 5 + ((i * 31.7) % 35),
        size: 2 + ((i * 1.9) % 5),
        delay: (i * 0.11) % 4.2,
        duration: 3.5 + ((i * 0.77) % 3.8),
        driftX: ((i * 43) % 140) - 70,
        driftY: 180 + ((i * 67) % 280),
        opacity: 0.45 + ((i * 0.11) % 0.55),
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.xPct}%`,
            bottom: `${p.yPct}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255,215,0,${p.opacity}) 0%, rgba(255,190,30,0) 70%)`,
          }}
          initial={{ y: 0, x: 0, opacity: 0, scale: 0.8 }}
          animate={
            active
              ? {
                  y: -p.driftY,
                  x: p.driftX,
                  opacity: [0, p.opacity, p.opacity * 0.7, 0],
                  scale: [0.8, 1.3, 1.0, 0.5],
                }
              : { opacity: 0 }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: active ? Infinity : 0,
            ease: 'easeOut',
            times: active ? [0, 0.15, 0.7, 1] : undefined,
          }}
        />
      ))}
    </div>
  );
}
