import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart } from 'lucide-react';

interface Props {
  onComplete: () => void;
  playTypingSfx?: () => void;
  playClickSfx?: () => void;
}

const MEMORIES = [
  "That time you laughed so hard you couldn't breathe and I didn't even understand why.",
  "The way you talk about things you love — like the whole world should stop and listen.",
  "The small things you notice that no one else does.",
  "The long conversation that we both had",
  "Watching you be kind to someone who didn't deserve it.",
];

const CARD_ROTATIONS = [-2, 1.5, -1, 2.5, -1.8];

// Stable background glow
const BG_ORBS = Array.from({ length: 8 }, (_, i) => ({
  left: 10 + i * 10,
  top: 15 + (i % 4) * 15,
  dur: 5 + i,
  delay: i * 0.7,
}));

export function Chapter6MemoryReel({ onComplete, playTypingSfx, playClickSfx }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(MEMORIES[currentIndex].slice(0, i));
      playTypingSfx?.();

      if (i >= MEMORIES[currentIndex].length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (isTyping) return;
    playClickSfx?.();
    if (currentIndex < MEMORIES.length - 1) {
      setCurrentIndex(c => c + 1);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card z-0" />

      {/* Floating accent orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {BG_ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{ left: `${orb.left}%`, top: `${orb.top}%` }}
            animate={{ y: [-8, 8, -8], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <h2 className="serif text-primary/80 uppercase tracking-[0.3em] text-sm mb-12">
          Things I remember
        </h2>

        {/* Card area */}
        <div className="relative w-full aspect-[3/4] mb-12 perspective-1000">
          {/* Glow behind card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ x: 140, opacity: 0, rotateY: -35, scale: 0.92 }}
              animate={{
                x: 0,
                opacity: 1,
                rotateY: 0,
                rotate: CARD_ROTATIONS[currentIndex],
                scale: 1,
              }}
              exit={{ x: -100, opacity: 0, rotateY: 35, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              whileHover={{ scale: 1.03, y: -8, boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
              className="absolute inset-0 rounded-2xl shadow-2xl bg-card p-8 flex flex-col items-center justify-center text-center overflow-hidden border border-primary/20"
            >
              {/* Paper-like texture via CSS */}
              <div
                className="absolute inset-0 z-0 opacity-15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(212,175,55,0.08) 28px, rgba(212,175,55,0.08) 29px)',
                }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-card/80 to-card" />

              <Heart className="w-6 h-6 text-primary/40 absolute top-8" />

              <p className="relative z-10 serif text-xl md:text-2xl leading-relaxed text-foreground/90">
                "{displayedText}"
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-0.5 h-5 bg-primary/60 ml-0.5 align-middle"
                  />
                )}
              </p>

              {/* Card dots */}
              <div className="absolute bottom-8 flex gap-2">
                {MEMORIES.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-primary' : 'bg-primary/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="h-16 flex items-center justify-center">
          {currentIndex < MEMORIES.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={isTyping}
              className={`flex items-center gap-2 transition-colors group p-4 ${
                isTyping
                  ? 'opacity-40 cursor-not-allowed'
                  : 'text-primary hover:text-primary/80 cursor-pointer'
              }`}
              data-testid="button-memory-next"
            >
              <span className="serif italic">Next memory</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isTyping ? 0 : 1, y: isTyping ? 10 : 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => { playClickSfx?.(); onComplete(); }}
              disabled={isTyping}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-sans font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none"
              data-testid="button-memory-finish"
            >
              Continue...
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
