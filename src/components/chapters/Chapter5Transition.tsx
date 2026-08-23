import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  playTypingSfx?: () => void;
  playClickSfx?: () => void;
}

const TEXT = "But before the fun ends... there's something real to say.";

// Stable background particle positions
const BG_PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  left: (i * 2.89) % 100,
  top: (i * 3.17) % 100,
  dur: 6 + (i % 6),
  delay: (i * 0.41) % 5,
}));

function getTypingDelay(char: string) {
  if (char === '.') return 450;
  if (char === ',') return 250;
  if (char === ' ') return 70;
  return 60 + (char.charCodeAt(0) % 40);
}

export function Chapter5Transition({ onComplete, playTypingSfx, playClickSfx }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [typingFinished, setTypingFinished] = useState(false);

  // Use a ref to avoid stale closure issues in the recursive setTimeout chain
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const introDelay = setTimeout(() => {
      let i = 0;

      const type = () => {
        setDisplayedText(TEXT.slice(0, i + 1));
        playTypingSfx?.();

        if (i >= TEXT.length - 1) {
          setTypingFinished(true);
          setTimeout(() => setShowButton(true), 2000);
          return;
        }

        const delay = getTypingDelay(TEXT[i]);
        i++;
        typingRef.current = setTimeout(type, delay);
      };

      type();
    }, 2000);

    return () => {
      clearTimeout(introDelay);
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="relative min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30 mix-blend-screen"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.4) 0%, rgba(0,0,0,0) 50%)',
            'radial-gradient(circle at 80% 70%, rgba(212,175,55,0.4) 0%, rgba(0,0,0,0) 50%)',
            'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.4) 0%, rgba(0,0,0,0) 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating soft shapes */}
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />

      {/* Background micro-particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {BG_PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ y: [-10, 10, -10], x: [-6, 6, -6], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl px-8 text-center flex flex-col items-center">
        <motion.h2
          className="handwriting text-4xl md:text-6xl text-primary/90 leading-relaxed min-h-[8rem]"
          animate={
            typingFinished
              ? { scale: 1.02, textShadow: '0 0 18px rgba(212,175,55,0.25)' }
              : {}
          }
          transition={{ duration: 1.5 }}
        >
          {displayedText}
          {/* Blinking cursor */}
          <motion.span
            animate={{ opacity: typingFinished ? [1, 0] : [1, 0, 1] }}
            transition={{ duration: 1, repeat: typingFinished ? 3 : Infinity }}
            className="inline-block ml-1 w-1 h-8 md:h-12 bg-primary/50 rounded-full"
          />
        </motion.h2>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="mt-16"
            >
              <button
                onClick={() => { playClickSfx?.(); onComplete(); }}
                className="text-foreground/60 hover:text-primary transition-colors serif tracking-widest uppercase text-sm border-b border-transparent hover:border-primary pb-1"
                data-testid="button-quiet-continue"
              >
                Keep reading...(Click here!)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
