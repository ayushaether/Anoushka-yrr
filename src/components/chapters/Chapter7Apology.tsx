import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  playTypingSfx?: () => void;
  playClickSfx?: () => void;
}

const APOLOGY_TEXT =
  "I know I haven’t always been perfect, and there were times I annoyed you, but the fact that you never let that come between us makes our bond even more precious to me. I can’t thank you enough for that. This isn’t just words,I mean every single one.";

function getWordDelay(word: string): number {
  if (word.endsWith('.')) return 700;
  if (word.endsWith(',')) return 450;
  if (word.endsWith('—')) return 800;
  if (word.endsWith('!') || word.endsWith('?')) return 700;
  return 180;
}

// Paper crane as pure SVG — no external asset needed
function PaperCrane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="100,20 180,130 100,100" fill="rgba(212,175,55,0.55)" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
      <polygon points="100,20 20,130 100,100" fill="rgba(212,175,55,0.4)" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
      <polygon points="100,100 20,130 100,180" fill="rgba(212,175,55,0.6)" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
      <polygon points="100,100 180,130 100,180" fill="rgba(212,175,55,0.45)" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
      <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" />
      <line x1="20" y1="130" x2="180" y2="130" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" />
      {/* Wings */}
      <polygon points="100,80 40,50 100,100" fill="rgba(212,175,55,0.35)" />
      <polygon points="100,80 160,50 100,100" fill="rgba(212,175,55,0.35)" />
    </svg>
  );
}

// Stable floating dots
const FLOAT_DOTS = Array.from({ length: 10 }, (_, i) => ({
  left: 10 + i * 8,
  top: 15 + (i % 5) * 15,
  dur: 5 + i,
  delay: i * 0.6,
}));

export function Chapter7Apology({ onComplete, playTypingSfx, playClickSfx }: Props) {
  const [words, setWords] = useState<string[]>([]);
  const [showCrane, setShowCrane] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const apologyWords = APOLOGY_TEXT.split(' ');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let i = 0;

    const scheduleNextWord = () => {
      if (i >= apologyWords.length) {
        setShowCursor(false);
        setTimeout(() => setShowButton(true), 2000);
        return;
      }

      const delay = getWordDelay(apologyWords[i] ?? '');

      timerRef.current = setTimeout(() => {
        setWords(apologyWords.slice(0, i + 1));
        playTypingSfx?.();

        if (i === Math.floor(apologyWords.length / 2)) {
          setShowCrane(true);
        }

        i++;
        scheduleNextWord();
      }, delay);
    };

    scheduleNextWord();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Soft spotlight */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Large central glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Floating dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {FLOAT_DOTS.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
            animate={{ y: [-8, 8, -8], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: dot.dur, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col">
        {/* Letter card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative overflow-hidden bg-card border border-primary/20 rounded-xl shadow-2xl p-8 md:p-12 min-h-[300px]"
        >
          {/* Paper texture via CSS lines */}
          <div
            className="absolute inset-0 opacity-8 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(212,175,55,0.06) 30px, rgba(212,175,55,0.06) 31px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/80 to-card" />

          {/* Text */}
          <p className="relative z-10 handwriting text-3xl md:text-4xl text-foreground/90 leading-relaxed tracking-wide">
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5 }}
                className="inline-block mr-2 mb-2"
              >
                {word}
              </motion.span>
            ))}
            {/* Blinking cursor */}
            {showCursor && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-8 ml-1 bg-primary align-middle"
              />
            )}
          </p>

          {/* Paper crane decoration */}
          <AnimatePresence>
            {showCrane && (
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20, rotate: -10 }}
                animate={{
                  opacity: 0.85,
                  x: [20, 0, 4, 0],
                  y: [20, 0, -8, 0],
                  rotate: [-4, 2, -2, 0],
                  scale: [1, 1.03, 1],
                }}
                transition={{ duration: 4, ease: 'easeOut' }}
                className="absolute z-20 -bottom-8 -right-8 w-32 h-32 md:w-48 md:h-48 pointer-events-none"
              >
                <PaperCrane className="w-full h-full drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Continue button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="mt-16 flex justify-center"
            >
              <button
                onClick={() => { playClickSfx?.(); onComplete(); }}
                className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-serif text-lg tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                data-testid="button-apology-acknowledge"
              >
                I hear you.
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
