import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

interface Props {
  playTypingSfx?: () => void;
  playBirthdaySfx?: () => void;
  onComplete?: () => void;
}

const CONFESSION_LINES = [
  'Here is the truth, Shriya.',
  'You are one of those rare people who make the world feel more alive just by being in it.',
  'Your laugh is contagious. Your kindness is effortless.',
  "And somewhere along the way, you became someone I genuinely care about — more than I've probably ever admitted.",
  'Happy Birthday. I hope this year gives you everything you deserve — which is everything.',
];

// Pre-generate particle data to avoid render-time randomness
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: (i * 1.87 * 100) % 100,
  width: 2 + ((i * 3.14) % 5),
  height: 2 + ((i * 2.71) % 5),
  dur: 4 + ((i * 1.13) % 5),
  delay: (i * 0.73) % 6,
}));

const FLOAT_ICONS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  isHeart: i % 2 === 0,
  delay: (i * 0.47) % 6,
  dur: 3 + ((i * 0.61) % 3),
  repeatDelay: (i * 0.53) % 4,
  x: Math.sin(i * 1.2) * 300,
  y: -(100 + ((i * 73) % 220)),
  size: 5 + ((i * 3) % 7),
}));

function Typewriter({ text, speed = 35, onTick }: { text: string; speed?: number; onTick?: () => void }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      onTick?.();
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayed}</>;
}

export function Chapter8Confession({ playTypingSfx, playBirthdaySfx, onComplete }: Props) {
  const [phase, setPhase] = useState<'card-enter' | 'reading' | 'finale' | 'fading'>('card-enter');
  const [currentLine, setCurrentLine] = useState(-1);
  const [showFinale, setShowFinale] = useState(false);
  const birthdaySfxFiredRef = useRef(false);

  // Phase 1: card entrance
  useEffect(() => {
    const t = setTimeout(() => setPhase('reading'), 3000);
    return () => clearTimeout(t);
  }, []);

  // Phase 2: confession lines sequence
  useEffect(() => {
    if (phase !== 'reading') return;
    let line = 0;

    const nextLine = () => {
      if (line < CONFESSION_LINES.length) {
        setCurrentLine(line);
        const duration =
          line === CONFESSION_LINES.length - 1
            ? CONFESSION_LINES[line].length * 75 + 4200
            : CONFESSION_LINES[line].length * 65 + 2600;
        line++;
        setTimeout(nextLine, duration);
      } else {
        setTimeout(() => {
          setPhase('finale');
          setShowFinale(true);
        }, 2200);
      }
    };

    setTimeout(nextLine, 800);
  }, [phase]);

  // Phase 3: fire birthday SFX once on finale
  useEffect(() => {
    if (!showFinale || birthdaySfxFiredRef.current) return;
    birthdaySfxFiredRef.current = true;
    setTimeout(() => playBirthdaySfx?.(), 500);
  }, [showFinale, playBirthdaySfx]);

  // After ~7 seconds of finale, fade out and transition to epilogue
  useEffect(() => {
    if (!showFinale) return;
    const fadeTimer = setTimeout(() => setPhase('fading'), 7000);
    const nextTimer = setTimeout(() => onComplete?.(), 10500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextTimer);
    };
  }, [showFinale, onComplete]);

  return (
    <motion.div
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background overflow-hidden px-6 text-center"
      animate={phase === 'fading' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 3.5, ease: 'easeInOut' }}
    >
      {/* Starry night gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(80,50,140,0.4) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.15) 0%, transparent 40%), ' +
            'radial-gradient(ellipse at 80% 80%, rgba(180,100,80,0.1) 0%, transparent 40%), ' +
            'linear-gradient(180deg, hsl(240,20%,5%) 0%, hsl(240,10%,3%) 100%)',
        }}
      />

      {/* Gold particle rain */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-yellow-300/70"
            style={{ left: `${p.left}%`, bottom: '-4px', width: p.width, height: p.height }}
            animate={{ y: [0, -(window.innerHeight + 40)], opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.75) 100%)' }}
      />

      {/* Reading Phase */}
      <AnimatePresence mode="wait">
        {phase === 'card-enter' && (
          <motion.div
            key="card-enter"
            className="relative z-10 max-w-lg"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-2xl border border-primary/20 px-10 py-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(80,50,140,0.12) 100%)',
                boxShadow: '0 0 80px rgba(212,175,55,0.08), inset 0 1px 0 rgba(212,175,55,0.15)',
              }}
            >
              <p className="serif italic text-primary/60 text-sm tracking-widest mb-4">— Chapter VIII —</p>
              <h2 className="serif text-4xl text-foreground/90 mb-4">The Truth</h2>
              <p className="text-foreground/40 text-sm">A confession, long overdue.</p>
            </div>
          </motion.div>
        )}

        {(phase === 'reading' || phase === 'finale' || phase === 'fading') && (
          <motion.div
            key="reading"
            className="relative z-10 max-w-2xl w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Glow orb */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: showFinale ? '600px' : '400px',
                height: showFinale ? '600px' : '400px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
                transition: 'all 3s ease',
              }}
            />

            {/* Confession lines */}
            <AnimatePresence>
              {!showFinale && currentLine >= 0 && currentLine < CONFESSION_LINES.length && (
                <motion.div
                  key={`line-${currentLine}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="px-6"
                >
                  <p
                    className={`serif leading-relaxed text-foreground/90 ${
                      currentLine === 0 ? 'text-xl text-primary/80 italic' : 'text-2xl md:text-3xl'
                    }`}
                  >
                    <Typewriter
                      text={CONFESSION_LINES[currentLine] ?? ''}
                      speed={currentLine === 0 ? 60 : 45}
                      onTick={playTypingSfx}
                    />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Finale */}
            <AnimatePresence>
              {showFinale && (
                <motion.div
                  key="finale"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-6 relative"
                >
                  {/* Radial glow */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: showFinale ? [0, 0.6, 0.4] : 0 }}
                    transition={{ duration: 4, ease: 'easeOut' }}
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(212,175,55,0.35) 0%, transparent 65%)',
                    }}
                  />

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
                    transition={{ duration: 1.5, ease: 'backOut' }}
                    className="text-primary"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.8))' }}
                  >
                    <Heart className="w-16 h-16 fill-current" />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1.5 }}
                    className="serif text-5xl md:text-7xl font-semibold text-primary leading-tight"
                    style={{ filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.5))' }}
                  >
                    Happy Birthday,
                    <br />
                    Shriya
                  </motion.h1>

                  {/* Floating hearts & stars */}
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {FLOAT_ICONS.map(icon => (
                      <motion.div
                        key={`icon-${icon.id}`}
                        initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                        animate={{
                          opacity: [0, 0.7, 0],
                          scale: [0, 1.4, 0],
                          y: icon.y,
                          x: icon.x,
                        }}
                        transition={{
                          duration: icon.dur,
                          repeat: Infinity,
                          repeatDelay: icon.repeatDelay,
                          delay: icon.delay,
                          ease: 'easeInOut',
                        }}
                        className="absolute top-1/2 left-1/2 text-primary/50"
                        style={{ marginLeft: -icon.size / 2, marginTop: -icon.size / 2 }}
                      >
                        {icon.isHeart ? (
                          <Heart className="fill-current" style={{ width: icon.size * 3, height: icon.size * 3 }} />
                        ) : (
                          <Star className="fill-current" style={{ width: icon.size * 2.5, height: icon.size * 2.5 }} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
