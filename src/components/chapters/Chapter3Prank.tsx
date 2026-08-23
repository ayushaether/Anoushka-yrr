import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/Confetti';

interface Props {
  onComplete: () => void;
  playPrankRevealSfx?: () => void;
}

type Phase = 'scan' | 'stuck' | 'error' | 'countdown' | 'reveal';

const SCAN_LINES = [
  'Initializing Birthday Security System v2.7.1...',
  'Loading global registry: 8,100,247,903 records',
  'Applying biometric filters...',
  'Cross-referencing with dimensional archives...',
  'Querying Universe_A.birthday_registry...',
  'Querying Parallel_Universe_B records...',
  'Scanning alternate timelines...',
  'Searching for: SHRIYA, birthday entry...',
];

const GLITCH_FRAMES = [
  '██ N O T H I N G ██',
  '██ N0TH1NG ██',
  '██ N█THING ██',
  '██ N O T F O U N D ██',
  '██ N O T H I N G ██',
];

export function Chapter3Prank({ onComplete, playPrankRevealSfx }: Props) {
  const [phase, setPhase] = useState<Phase>('scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [glitchText, setGlitchText] = useState(GLITCH_FRAMES[0]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Scan → Stuck
  useEffect(() => {
    if (phase !== 'scan') return;
    const cleanups: (() => void)[] = [];

    SCAN_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, i * 550);
      cleanups.push(() => clearTimeout(t));
    });

    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 1.5;
      if (prog >= 99) {
        setScanProgress(99);
        clearInterval(progInterval);
        const t2 = setTimeout(() => setPhase('stuck'), 300);
        cleanups.push(() => clearTimeout(t2));
      } else {
        setScanProgress(prog);
      }
    }, 70);
    cleanups.push(() => clearInterval(progInterval));

    return () => cleanups.forEach(fn => fn());
  }, [phase]);

  // Stuck → Error
  useEffect(() => {
    if (phase !== 'stuck') return;
    const cleanups: (() => void)[] = [];

    const t1 = setTimeout(() => setVisibleLines(prev => [...prev, '> Still scanning… please hold.']), 800);
    const t2 = setTimeout(() => setVisibleLines(prev => [...prev, '> This is taking longer than expected.']), 1800);
    const t3 = setTimeout(() => setVisibleLines(prev => [...prev, '> Hmm.']), 2800);

    const flickerInterval = setInterval(() => {
      setScanProgress(prev => (prev === 99 ? 98 : 99));
    }, 250);

    const t4 = setTimeout(() => {
      clearInterval(flickerInterval);
      setScanProgress(99);
      setPhase('error');
    }, 3600);

    cleanups.push(
      () => clearTimeout(t1),
      () => clearTimeout(t2),
      () => clearTimeout(t3),
      () => clearInterval(flickerInterval),
      () => clearTimeout(t4),
    );

    return () => cleanups.forEach(fn => fn());
  }, [phase]);

  // Error — glitch animation + vibrate
  useEffect(() => {
    if (phase !== 'error') return;
    const cleanups: (() => void)[] = [];

    if ('vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200, 100, 400]); } catch (_) {}
    }

    let gi = 0;
    const glitchInterval = setInterval(() => {
      gi = (gi + 1) % GLITCH_FRAMES.length;
      setGlitchText(GLITCH_FRAMES[gi]);
    }, 120);
    cleanups.push(() => clearInterval(glitchInterval));

    const t = setTimeout(() => setPhase('countdown'), 3000);
    cleanups.push(() => clearTimeout(t));

    return () => cleanups.forEach(fn => fn());
  }, [phase]);

  // Countdown → Reveal
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      playPrankRevealSfx?.();
      setShowConfetti(true);
      setPhase('reveal');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, playPrankRevealSfx]);

  // Auto-advance from reveal
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(onComplete, 6000);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-background relative">
      <AnimatePresence mode="wait">

        {/* SCAN + STUCK */}
        {(phase === 'scan' || phase === 'stuck') && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg mx-auto px-6 py-8"
          >
            {/* Header bar */}
            <div className="flex items-center gap-3 mb-4 border border-primary/20 bg-card/60 backdrop-blur-sm rounded-t-lg px-4 py-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="font-mono text-xs text-foreground/50 flex-1 text-center tracking-wide">
                Birthday Security System — Terminal v2.7.1
              </span>
            </div>

            {/* Terminal body */}
            <div
              ref={terminalRef}
              className="bg-[#0a0a0f] border border-primary/15 border-t-0 rounded-b-lg px-5 py-4 h-52 overflow-hidden font-mono text-xs space-y-1.5"
            >
              {visibleLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={line.startsWith('>') ? 'text-yellow-400/80' : 'text-green-400/80'}
                >
                  {line.startsWith('>') ? line : `$ ${line}`}
                </motion.p>
              ))}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-3.5 bg-green-400/80 align-middle"
              />
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-foreground/50">Scanning database</span>
                <motion.span
                  className={`font-mono text-xs font-bold ${phase === 'stuck' ? 'text-amber-400 animate-pulse' : 'text-primary'}`}
                >
                  {Math.round(scanProgress)}%
                </motion.span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                />
              </div>
              {phase === 'stuck' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-400/70 font-mono mt-1.5 animate-pulse"
                >
                  ⚠ Stuck at 99%… please wait…
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: [0, -8, 8, -8, 8, -4, 4, 0] }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md mx-auto px-6 text-center"
          >
            {/* Flashing red glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.08, 0, 0.12, 0, 0.06, 0] }}
              transition={{ duration: 1.2, times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1] }}
              style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
            />

            <motion.div
              animate={{ rotate: [-2, 2, -2, 2, 0] }}
              transition={{ duration: 0.4, times: [0, 0.25, 0.5, 0.75, 1] }}
              className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-destructive/15 border border-destructive/40 flex items-center justify-center"
            >
              <span className="text-3xl">⛔</span>
            </motion.div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-4">
              <p className="font-mono text-destructive text-sm font-bold mb-2">
                CRITICAL ERROR — CODE 0xBD_404
              </p>
              <p className="font-mono text-destructive/80 text-xs leading-relaxed">
                SHRIYA_BIRTHDAY_DATA: NOT FOUND<br />
                Searched: 8,100,247,903 records<br />
                Searched: 47 alternate timelines<br />
                Searched: 3 parallel universes<br />
                Result: {glitchText}
              </p>
            </div>

            <p className="text-foreground/60 text-sm mb-4 font-mono">
              It appears... Shriya was never born?
            </p>

            <div className="flex items-center justify-center gap-2 text-destructive/60 text-xs font-mono animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 animate-ping" />
              INITIATING BIRTHDAY PURGE PROTOCOL...
            </div>
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(12px)' }}
            transition={{ duration: 0.3 }}
            className="text-center px-8"
          >
            <p className="font-mono text-destructive/80 text-sm uppercase tracking-widest mb-6 animate-pulse">
              Purging all birthday memories in...
            </p>
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="font-mono text-9xl font-black text-destructive"
              style={{ textShadow: '0 0 40px rgba(239,68,68,0.6)' }}
            >
              {countdown}
            </motion.div>
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="font-mono text-xs text-destructive/50 mt-6 uppercase tracking-widest"
            >
              This is not a drill.
            </motion.p>
          </motion.div>
        )}

        {/* REVEAL */}
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-primary z-50 p-8 text-center overflow-hidden"
          >
            <Confetti active={showConfetti} count={250} />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-primary-foreground/80 font-mono text-lg mb-4 tracking-widest uppercase"
            >
              System status:
            </motion.p>

            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
              className="text-primary-foreground font-black leading-none mb-6"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
            >
              GOTCHA!!
            </motion.h1>

            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-primary-foreground text-primary px-7 py-4 rounded-full shadow-2xl flex items-center gap-3"
              style={{ fontSize: 'clamp(1.1rem, 4vw, 2rem)', fontWeight: 800 }}
            >
              <span>🎂</span>
              <span>HAPPY BIRTHDAY, SHRIYA!!</span>
              <span>🎉</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-primary-foreground/70 mt-6 serif text-lg"
            >
              😂 Relax!! Did you really think i forget your b'day?
              <br />
              For a second there... you looked worried 😝
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
