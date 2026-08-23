import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/Confetti';

interface Props {
  onComplete: () => void;
  playMatchSfx?: () => void;
  playMismatchSfx?: () => void;
  playVictorySfx?: () => void;
  playClickSfx?: () => void;
}

interface CardTheme {
  emoji: string;
  glow: string;
  bg: string;
  border: string;
}

const CARD_THEMES: CardTheme[] = [
  { emoji: '🎂', glow: '#ec4899', bg: 'from-pink-600/30 to-rose-500/10', border: 'border-pink-500/50' },
  { emoji: '🎁', glow: '#8b5cf6', bg: 'from-violet-600/30 to-purple-500/10', border: 'border-violet-500/50' },
  { emoji: '🎈', glow: '#3b82f6', bg: 'from-blue-600/30 to-sky-500/10', border: 'border-blue-500/50' },
  { emoji: '⭐', glow: '#f59e0b', bg: 'from-amber-500/30 to-yellow-400/10', border: 'border-amber-400/50' },
  { emoji: '🌸', glow: '#d946ef', bg: 'from-fuchsia-600/30 to-pink-500/10', border: 'border-fuchsia-500/50' },
  { emoji: '🎵', glow: '#06b6d4', bg: 'from-cyan-600/30 to-teal-500/10', border: 'border-cyan-500/50' },
  { emoji: '💖', glow: '#ef4444', bg: 'from-red-600/30 to-rose-500/10', border: 'border-red-500/50' },
  { emoji: '🎉', glow: '#f97316', bg: 'from-orange-500/30 to-amber-400/10', border: 'border-orange-400/50' },
];

const TOTAL_PAIRS = CARD_THEMES.length;
const TOTAL_CARDS = TOTAL_PAIRS * 2;
const TIME_LIMIT = 90;

interface Card {
  id: number;
  themeIdx: number;
  isFlipped: boolean;
  isMatched: boolean;
}

function getRating(moves: number): { stars: number; msg: string } {
  if (moves <= 12) return { stars: 3, msg: 'Incredible memory! You were born for this. 🌟' };
  if (moves <= 18) return { stars: 2, msg: 'Great job! Sharp as ever. 💫' };
  return { stars: 1, msg: 'You did it! The heart remembers what the mind forgets. 💖' };
}

// Pre-generate burst directions to avoid render-time randomness
const BURST_DIRS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return { dx: Math.cos(angle) * 45, dy: Math.sin(angle) * 45 };
});

// Stable star particles background
const STAR_PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 2.57) % 100,
  top: (i * 3.71) % 100,
  dur: 6 + (i % 6),
  delay: (i * 0.37) % 5,
}));

export function Chapter2Puzzle({ onComplete, playMatchSfx, playMismatchSfx, playVictorySfx, playClickSfx }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [message, setMessage] = useState('Find all matching pairs!');
  const [burstCard, setBurstCard] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [comboPopup, setComboPopup] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initCards = useCallback(() => {
    // Stable shuffle using index-based deterministic seed
    const indices = [...Array(TOTAL_PAIRS).keys(), ...Array(TOTAL_PAIRS).keys()];
    // Fisher-Yates with Math.random (only at init time, not in render)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const deck = indices.map((themeIdx, id) => ({
      id,
      themeIdx,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(deck);
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
    setIsCompleted(false);
    setIsTimedOut(false);
    setMessage('Find all matching pairs!');
    setCombo(0);
    setBestCombo(0);
  }, []);

  useEffect(() => {
    initCards();
  }, [initCards]);

  // Timer
  useEffect(() => {
    if (isCompleted || isTimedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted, isTimedOut]);

  const handleCardClick = useCallback(
    (idx: number) => {
      if (isLocked || flipped.length >= 2 || cards[idx].isFlipped || cards[idx].isMatched || isCompleted) return;

      const newCards = cards.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c));
      const newFlipped = [...flipped, idx];
      setCards(newCards);
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setIsLocked(true);
        setMoves(m => m + 1);
        const [i1, i2] = newFlipped;

        if (newCards[i1].themeIdx === newCards[i2].themeIdx) {
          // Match!
          playMatchSfx?.();
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          setBestCombo(prev => Math.max(prev, nextCombo));

          if (nextCombo >= 2) {
            setComboPopup(`🔥 Combo x${nextCombo}!`);
            setTimeout(() => setComboPopup(null), 1200);
          }

          setBurstCard(i1);
          setTimeout(() => setBurstCard(i2), 60);

          setTimeout(() => {
            setBurstCard(null);
            setCards(prev =>
              prev.map((c, i) => (i === i1 || i === i2 ? { ...c, isMatched: true } : c)),
            );
            setFlipped([]);
            setIsLocked(false);
            const newMatches = matches + 1;
            setMatches(newMatches);

            const msgs = ['Nice one! ✨', 'Perfect match! 💫', 'You got it! 🌸', 'Sharp! 💎', 'Memory queen! 👑'];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);

            if (newMatches === TOTAL_PAIRS) {
              setTimeout(() => {
                document.body.style.transition = 'filter 0.5s ease';
                document.body.style.filter = 'brightness(1.15)';
                playVictorySfx?.();
                setIsCompleted(true);
                setShowConfetti(true);
                setTimeout(() => {
                  document.body.style.filter = 'brightness(1)';
                }, 700);
                setMessage("All matched! You're amazing! 🎊");
              }, 400);
            }
          }, 600);
        } else {
          // Mismatch
          playMismatchSfx?.();
          setCombo(0);
          setComboPopup('Combo Broken 💔');
          setTimeout(() => setComboPopup(null), 900);
          setMessage('Not quite — try again! 🙈');
          setTimeout(() => {
            setCards(prev =>
              prev.map((c, i) => (i === i1 || i === i2 ? { ...c, isFlipped: false } : c)),
            );
            setFlipped([]);
            setIsLocked(false);
          }, 900);
        }
      }
    },
    [isLocked, flipped, cards, isCompleted, matches, combo, playMatchSfx, playMismatchSfx, playVictorySfx],
  );

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 30 ? '#4ade80' : timeLeft > 10 ? '#facc15' : '#f87171';

  const rating = useMemo(() => (isCompleted ? getRating(moves) : null), [isCompleted, moves]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-4 py-6 relative overflow-hidden">
      <Confetti active={showConfetti} count={100} />

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        {STAR_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: 2, height: 2, left: `${p.left}%`, top: `${p.top}%`, opacity: 0.5 }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-5 w-full max-w-md"
      >
        <h2 className="handwriting text-4xl md:text-5xl text-primary mb-1">The Memory Puzzle</h2>
        <p className="serif text-sm text-foreground/60 min-h-[1.5rem] transition-all duration-300">{message}</p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center gap-4 mb-5 w-full max-w-md"
      >
        {/* Timer */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-foreground/50 uppercase tracking-wider">Time</span>
            <span
              className="text-sm font-mono font-bold tabular-nums transition-colors duration-300"
              style={{ color: timerColor }}
            >
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-colors duration-500"
              style={{ backgroundColor: timerColor }}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Pairs */}
        <div className="text-center">
          <div className="text-lg font-bold text-primary tabular-nums">
            {matches}
            <span className="text-foreground/30">/{TOTAL_PAIRS}</span>
          </div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider">Pairs</div>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Moves */}
        <div className="text-center">
          <div className="text-lg font-bold text-foreground/80 tabular-nums">{moves}</div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider">Moves</div>
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="text-center">
          <div className="text-lg font-bold text-primary tabular-nums">{bestCombo}</div>
          <div className="text-xs text-foreground/50 uppercase tracking-wider">Best Combo</div>
        </div>
      </motion.div>

      {/* Combo popup */}
      <AnimatePresence>
        {comboPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-primary text-primary-foreground shadow-xl font-semibold"
          >
            {comboPopup}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement banner */}
      <AnimatePresence>
        {bestCombo >= 4 && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 z-40 bg-amber-400 text-black px-5 py-2 rounded-full font-semibold shadow-xl"
          >
            🏆 Achievement Unlocked — Combo Master
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-2 md:gap-3 w-full max-w-md">
        {cards.map((card, idx) => {
          const theme = CARD_THEMES[card.themeIdx];
          const isBursting = burstCard === idx;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.04, type: 'spring', stiffness: 220, damping: 18 }}
              className="aspect-square relative"
            >
              <motion.div
                className="w-full h-full relative cursor-pointer select-none"
                style={{ perspective: 600 }}
                onClick={() => handleCardClick(idx)}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.08, y: -8, rotate: -2 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                data-testid={`card-${idx}`}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.38, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl bg-card border border-card-border flex items-center justify-center hover:border-primary/30 transition-colors shadow-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-primary/15" />
                  </div>

                  {/* Back face */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${theme.bg} border ${theme.border} rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-lg`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    animate={
                      card.isMatched
                        ? {
                            boxShadow: [
                              `0 0 0px ${theme.glow}00`,
                              `0 0 25px ${theme.glow}60`,
                              `0 0 12px ${theme.glow}`,
                            ],
                            scale: [1, 1.08, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 1.2 }}
                  >
                    {theme.emoji}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Burst particles on match */}
              <AnimatePresence>
                {isBursting && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {BURST_DIRS.map((dir, bi) => (
                      <motion.div
                        key={bi}
                        className="absolute rounded-full"
                        style={{
                          width: 5,
                          height: 5,
                          top: '50%',
                          left: '50%',
                          backgroundColor: theme.glow,
                          marginTop: -2.5,
                          marginLeft: -2.5,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: dir.dx, y: dir.dy, opacity: 0, scale: 0 }}
                        exit={{}}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Time-out overlay */}
      <AnimatePresence>
        {isTimedOut && !isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="max-w-sm"
            >
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="handwriting text-4xl text-primary mb-3">Time's Up!</h3>
              <p className="serif text-foreground/70 mb-8">
                The memories are still there — just a little hidden. Want to try again?
              </p>
              <button
                onClick={() => { playClickSfx?.(); initCards(); }}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20"
                data-testid="button-puzzle-retry"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory overlay */}
      <AnimatePresence>
        {isCompleted && rating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.45, delay: 0.2 }}
              className="max-w-sm"
            >
              {/* Stars */}
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3].map(s => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + s * 0.15, type: 'spring', stiffness: 300 }}
                    className={`text-4xl ${s <= rating.stars ? 'opacity-100' : 'opacity-20'}`}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              <h3 className="handwriting text-5xl text-primary mb-3">The Vault Opens...</h3>
              <div className="mb-3">
                <p className="serif text-foreground/80 text-lg">You unlocked every hidden memory.</p>
                <p className="text-foreground/60 text-base mt-2">
                  Every match brought you one step closer to what comes next.
                </p>
              </div>
              <p className="text-sm text-foreground/40 mb-6">
                {moves} moves · {TIME_LIMIT - timeLeft}s
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-6xl mb-6"
              >
                ✉️
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClickSfx?.();
                  document.body.style.transition = 'opacity .8s ease';
                  document.body.style.opacity = '0';
                  setTimeout(() => {
                    onComplete();
                    document.body.style.opacity = '1';
                  }, 800);
                }}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                data-testid="button-puzzle-next"
              >
                Open The Letter →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
