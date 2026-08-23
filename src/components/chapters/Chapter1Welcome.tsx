import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

interface Props {
  onComplete: () => void;
  playClickSfx?: () => void;
}

// Pre-generate bokeh positions so they're stable across renders
const BOKEH = Array.from({ length: 50 }, (_, i) => ({
  left: ((i * 37.3) % 100),
  top: ((i * 53.7) % 100),
  width: 2 + (i % 5),
  height: 2 + (i % 5),
  opacity: 0.2 + (i % 8) * 0.08,
  dur: 6 + (i % 8),
  delay: (i * 0.23) % 5,
}));

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: 40 + ((i * 5.1) % 20),
  top: 40 + ((i * 3.7) % 20),
  dur: 2 + (i % 3),
  delay: (i * 0.41) % 2,
}));

export function Chapter1Welcome({ onComplete, playClickSfx }: Props) {
  const [showButton, setShowButton] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 6500);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    playClickSfx?.();
    if ('vibrate' in navigator) navigator.vibrate(80);
    document.body.style.cursor = 'wait';
    setOpening(true);
    setTimeout(() => {
      onComplete();
      document.body.style.cursor = 'default';
    }, 1500);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Rich gradient background — deep indigo → warm gold */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(100,80,180,0.35) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 70% 60%, rgba(212,175,55,0.25) 0%, transparent 55%), ' +
            'linear-gradient(160deg, hsl(240,20%,7%) 0%, hsl(240,10%,4%) 100%)',
        }}
      />

      {/* Animated bokeh orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {BOKEH.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-200"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.width}px`,
              height: `${b.height}px`,
              opacity: b.opacity,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-10, 10, -10],
              opacity: [b.opacity * 0.4, b.opacity, b.opacity * 0.4],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: b.dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: b.delay,
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-md px-6 text-center">
        <AnimatePresence>
          {!opening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="flex flex-col items-center"
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  textShadow: [
                    '0 0 0px rgba(255,255,255,0)',
                    '0 0 30px rgba(255,220,120,.6)',
                    '0 0 0px rgba(255,255,255,0)',
                  ],
                }}
                transition={{
                  delay: 1,
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="handwriting text-7xl md:text-8xl text-primary mb-6"
              >
                Shriya
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1.5 }}
                className="serif text-xl md:text-2xl text-foreground/80 tracking-wide"
              >
                Not every gift comes wrapped.
                <br />
                Some arrive as memories
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButton && !opening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 6, filter: 'blur(8px)' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-12"
            >
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.08, rotate: -4, y: -4 }}
                whileTap={{ scale: 0.94 }}
                animate={{ y: [-6, 6, -6], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="group relative flex flex-col items-center gap-4 cursor-pointer focus:outline-none"
                data-testid="button-open-envelope"
              >
                {/* Sparkle particles around button */}
                {SPARKLES.map((s, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
                    style={{ left: `${s.left}%`, top: `${s.top}%` }}
                    animate={{ y: [-20, 20], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{
                      duration: s.dur,
                      repeat: Infinity,
                      delay: s.delay,
                    }}
                  />
                ))}

                <div className="relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute w-44 h-44 rounded-full bg-yellow-300 blur-3xl opacity-25 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-yellow-200/20" />
                  <motion.div
                    animate={{ rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <Mail className="w-11 h-11 text-primary relative z-10" />
                  </motion.div>
                  <div className="absolute inset-0 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center opacity-0 group-hover:opacity-100" />
                </div>

                <span className="serif text-primary/80 uppercase tracking-widest text-sm group-hover:text-primary transition-colors">
                  Begin Your Story →😝
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
