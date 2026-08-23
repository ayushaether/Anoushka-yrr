import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldenParticles } from '@/components/ending/GoldenParticles';
import { WarmLight } from '@/components/ending/WarmLight';
import { RoseBloom } from '@/components/ending/RoseBloom';
import { GiftCard } from '@/components/ending/GiftCard';
import { FinalMessage } from '@/components/ending/FinalMessage';
import { WebsiteExperience } from '@/components/WebsiteExperience';

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  fadeOutAudio?: () => void;
  playGiftReadySfx?: () => void;
  playTulipBloomSfx?: () => void;   // reused as "rose bloom" SFX
}

// ─── Pre-generated stable data ─────────────────────────────────────────────

const STARS_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  startX: ((i * 37.3 + 12) % 100) - 50,
  startY: ((i * 53.7 + 8) % 100) - 50,
  angle: (i * 23.7) % 360,
  dur: 2.8 + ((i * 0.41) % 1.8),
  delay: (i * 0.31) % 3.5,
  size: 4 + ((i * 2) % 6),
}));

const BOKEH = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 3.37) % 100,
  top: (i * 5.73) % 100,
  size: 2 + (i % 4),
  dur: 5 + (i % 6),
  delay: (i * 0.27) % 4,
}));

const LETTER_PARAGRAPHS = [
   'One last page...',
  '',
  "Howdy? 🤠 Ig it might be around 12:09 if not then perhaps i would have become lazy and fogot to give you this. I wanted to wish you 1st but I think I'm not? 🤔 Maybe 2nd, no? Okay!... Okay! then 3rd? Still no? 🥲 Forget it. Wishing you is imp, not ranking.",

  "You’re actually not just a friend; you’re my built-in best friend. Whenever I talk to you, even for a few minutes, my whole mood changes. I don’t know how, maybe you got some kind of powers? Hmm..🧐",

     "No filters, no fake vibes, just you. And as an introvert, having someone like you is truly a blessing... I could've written a poem instead of this, but I don't think any poem could do you justice. Yes sirrr! I'm a poet and writer.",

  "Well, I could have just wished you like normal ppl, like texting 'happy b'day' or posting a story. Then what would be the difference between them and me? 😮‍💨",

  "So it's my way of wishing to special ones and this might be the last time I'm making this 🥀 (ig?). Also sorry for taking your photos without your consent 😝.",

  "And don't start with Call me didi just cause you are 1yr older than me 😒. Chachi, you may be older than me in age but you'll still be a chirkut (Duckling, cute one though) 🐥. Now, say 'I'm the best!' and go enjoy your day.",

  "I really don't know what else to say. I'm just grateful and ik it may kinda sound cringee? If so, really solly. I'm juust a geek I guess hehehehe!",

  '',
"last thing I want to say………actually I",

  '',

  "LOVE….I LOVE",

  '',

  "MONEY,CASH AS MUCH AS CASH YOU CAN GIVE. Sorry jokeside",
  '',

  'Happy Birthday once again, Shriya. ❤️',
];

const PHOTO_ROTATIONS = [-3.2, 2.1, -1.8, 3.5];

// ─── Scene type ──────────────────────────────────────────────────────────────

type Scene =
  | 'idle'
  | 'jar-enter'
  | 'stars-float'
  | 'jar-glow'
  | 'jar-fade'
  | 'journal-open'
  | 'letter'
  | 'journal-close'
  | 'fade-black'
  | 'gift-card'
  | 'gift-ready'
  // ── New ending (credits → rose) ──
  | 'credits'       // "Made by Ayush" appears FIRST
  | 'rose-grow'     // credits fades, rose stem grows
  | 'rose-bloom'    // petals open + SFX
  | 'final-message' // "Some memories don't fade. They simply bloom."
  | 'done'
  | 'website';

// ─── Memory Jar ──────────────────────────────────────────────────────────────

function MemoryJar({ glowing }: { glowing: boolean }) {
  return (
    <svg width="200" height="260" viewBox="0 0 200 260" fill="none">
      <defs>
        <filter id="jarGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={glowing ? '10' : '4'} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(212,175,55,0.18)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.12)" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,175,55,0.55)" />
          <stop offset="100%" stopColor="rgba(180,130,30,0.4)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="252" rx="55" ry="7" fill="rgba(0,0,0,0.25)" />
      <path
        d="M45 80 Q38 100 38 150 Q38 230 100 235 Q162 230 162 150 Q162 100 155 80 Z"
        fill="url(#glassGrad)" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5"
        filter="url(#jarGlow)"
      />
      <path d="M52 95 Q48 130 50 175" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
      <path d="M142 100 Q146 135 144 170" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
      {glowing && <ellipse cx="100" cy="165" rx="48" ry="55" fill="rgba(212,175,55,0.22)" style={{ filter: 'blur(14px)' }} />}
      <rect x="55" y="60" width="90" height="22" rx="5" fill="url(#lidGrad)" stroke="rgba(212,175,55,0.5)" strokeWidth="1" />
      <rect x="62" y="55" width="76" height="10" rx="3" fill="rgba(212,175,55,0.45)" />
      <rect x="50" y="78" width="100" height="6" rx="3" fill="rgba(212,175,55,0.25)" />
    </svg>
  );
}

function FloatingStar({ star, absorbed }: { star: typeof STARS_DATA[0]; absorbed: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={{ width: star.size * 2, height: star.size * 2, top: '50%', left: '50%' }}
      initial={{ x: star.startX * 4, y: star.startY * 3, opacity: 0, scale: 0, rotate: star.angle }}
      animate={
        absorbed
          ? { x: 0, y: 0, opacity: [1, 1, 0], scale: [1, 0.4, 0], rotate: star.angle + 360 }
          : { x: 0, y: 0, opacity: [0, 0.9, 0.9], scale: [0, 1, 1], rotate: star.angle + 180 }
      }
      transition={{ duration: star.dur, delay: star.delay, ease: absorbed ? 'easeIn' : 'easeOut' }}
    >
      <svg viewBox="0 0 20 20" width={star.size * 2} height={star.size * 2}>
        <polygon points="10,1 12.5,7 19,7 14,12 16,19 10,15 4,19 6,12 1,7 7.5,7" fill="rgba(212,175,55,0.85)" stroke="rgba(255,235,150,0.6)" strokeWidth="0.5" />
      </svg>
    </motion.div>
  );
}

function ScrapbookPage({ letterProgress, photoCount }: { letterProgress: number; photoCount: number }) {
  const letterText = LETTER_PARAGRAPHS.join('\n');
  const visibleChars = Math.floor(letterText.length * letterProgress);
  const visibleText = letterText.slice(0, visibleChars);

  return (
    <div
      className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e8dcc8 0%, #f0e6d2 40%, #ede0c4 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
        minHeight: '520px',
      }}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(160,120,60,0.08) 28px, rgba(160,120,60,0.08) 29px)' }} />
      <div className="absolute -top-1 -left-1 w-20 h-8 opacity-70 z-10 rounded-sm" style={{ background: 'rgba(255,180,100,0.55)', transform: 'rotate(-2deg)' }} />
      <div className="absolute -top-1 right-4 w-16 h-7 opacity-60 z-10 rounded-sm" style={{ background: 'repeating-linear-gradient(90deg, rgba(180,220,180,0.7) 0px, rgba(180,220,180,0.7) 8px, rgba(150,200,150,0.5) 8px, rgba(150,200,150,0.5) 16px)', transform: 'rotate(1.5deg)' }} />
      <div className="relative z-10 p-7 pt-8">
        <p className="handwriting text-2xl mb-5 text-center" style={{ color: 'rgba(100,70,40,0.85)', letterSpacing: '0.02em' }}>
          One last page...
        </p>
        <div className="handwriting text-base leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'rgba(80,55,30,0.88)', minHeight: '180px', fontSize: '1.05rem' }}>
          {visibleText.split('\n').slice(1).join('\n')}
          {letterProgress < 1 && (
            <span className="inline-block w-0.5 h-5 ml-0.5 align-middle" style={{ background: 'rgba(100,70,40,0.7)', animation: 'cursorBlink 0.8s step-end infinite' }} />
          )}
        </div>
        <div className="relative mt-4" style={{ minHeight: photoCount > 0 ? '180px' : '0' }}>
          {[0, 1, 2, 3].map(idx => (
            <AnimatePresence key={idx}>
              {idx < photoCount && (
                <motion.div
                  key={`photo-${idx}`}
                  className="absolute"
                  style={{ left: `${18 + idx * 18}%`, top: `${idx % 2 === 0 ? 10 : 50}px`, rotate: PHOTO_ROTATIONS[idx], zIndex: idx + 1 }}
                  initial={{ opacity: 0, scale: 0.6, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm opacity-70 z-10" style={{ background: idx % 2 === 0 ? 'rgba(255,200,130,0.65)' : 'repeating-linear-gradient(90deg, rgba(180,220,180,0.6) 0px, rgba(180,220,180,0.6) 6px, rgba(150,200,150,0.4) 6px, rgba(150,200,150,0.4) 12px)' }} />
                  <div className="rounded-sm overflow-hidden" style={{ background: '#f9f5ee', padding: '6px 6px 22px 6px', boxShadow: '0 4px 18px rgba(0,0,0,0.3)', width: '90px' }}>
                    <img src={`${import.meta.env.BASE_URL}photos/photo${idx + 1}.jpg`} alt={`Memory ${idx + 1}`} className="w-full object-cover rounded-sm" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
      <style>{`@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function Chapter9Epilogue({ fadeOutAudio, playGiftReadySfx, playTulipBloomSfx }: Props) {
  const [scene,         setScene]         = useState<Scene>('idle');
  const [starsAbsorbed, setStarsAbsorbed] = useState(false);
  const [jarGlowing,    setJarGlowing]    = useState(false);
  const [letterProgress, setLetterProgress] = useState(0);
  const [photoCount,    setPhotoCount]    = useState(0);
  const [roseVisible,   setRoseVisible]   = useState(false);

  const letterRafRef = useRef<number | null>(null);
  const roseTimersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Main story timeline ─────────────────────────────────────────────────
  useEffect(() => {
    const seq: [number, () => void][] = [
      [200,   () => setScene('jar-enter')],
      [2200,  () => setScene('stars-float')],
      [8000,  () => { setStarsAbsorbed(true); setScene('jar-glow'); }],
      [10000, () => setJarGlowing(true)],
      [12500, () => setScene('jar-fade')],
      [15000, () => setScene('journal-open')],
      [17500, () => {
        setScene('letter');
        const totalChars = LETTER_PARAGRAPHS.join('\n').length;
        const revealDuration = 120000;
        const startedAt = performance.now();
        let lastVisibleChars = -1;
        const reveal = (now: number) => {
          const progress = totalChars > 0
            ? Math.min((now - startedAt) / revealDuration, 1)
            : 1;
          const visibleChars = Math.floor(totalChars * progress);
          if (visibleChars !== lastVisibleChars) {
            lastVisibleChars = visibleChars;
            setLetterProgress(progress);
          }
          if (progress < 1) {
            letterRafRef.current = requestAnimationFrame(reveal);
          } else {
            letterRafRef.current = null;
          }
        };
        letterRafRef.current = requestAnimationFrame(reveal);
        [4000, 8000, 13000, 18000].forEach((d, idx) => setTimeout(() => setPhotoCount(idx + 1), d));
      }],
      [150000, () => setScene('journal-close')],
      [153500, () => { fadeOutAudio?.(); setScene('fade-black'); }],
      [156000, () => setScene('gift-card')],
      [171000, () => { playGiftReadySfx?.(); setScene('gift-ready'); }],
    ];

    const timers = seq.map(([delay, fn]) => setTimeout(fn, delay));
    return () => {
      timers.forEach(clearTimeout);
      roseTimersRef.current.forEach(clearTimeout);
      if (letterRafRef.current !== null) cancelAnimationFrame(letterRafRef.current);
    };
  }, []);

  // ── Gift button → credits first → rose bloom ───────────────────────────
  const handleGiftButtonClick = useCallback(() => {
    // 1. Credits appear on dark background
    setScene('credits');

    const add = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      roseTimersRef.current.push(t);
    };

    // 2. Credits fades, rose grows
    add(() => {
      setScene('rose-grow');
      setRoseVisible(true);
    }, 3800);

    // 3. Petals open — fires ~2.4 s after rose becomes visible (matches RoseBloom internal timer)
    add(() => {
      setScene('rose-bloom');
      playTulipBloomSfx?.();
    }, 6300);

    // 4. Final poetic message
    add(() => setScene('final-message'), 14500);

    // 5. Fade out
    add(() => setScene('done'), 25000);
    // Start the separate website only after the complete rose ending has finished.
    add(() => setScene('website'), 30000);
  }, [playTulipBloomSfx]);

  // ── Derived flags ───────────────────────────────────────────────────────
  const showJar      = ['jar-enter', 'stars-float', 'jar-glow'].includes(scene);
  const showJournal  = ['journal-open', 'letter', 'journal-close'].includes(scene);
  const journalClose = scene === 'journal-close';
  const showGiftCard = ['gift-card', 'gift-ready'].includes(scene);
  const showGiftBtn  = scene === 'gift-ready';

  // Credits scene — appears FIRST (immediately on button click)
  const showCredits  = scene === 'credits';

  // Rose scenes
  const showRose      = ['rose-grow', 'rose-bloom', 'final-message', 'done'].includes(scene);
  const showParticles = showRose;
  const showWarmLight = ['rose-bloom', 'final-message', 'done'].includes(scene);
  const showFinalMsg  = ['final-message', 'done'].includes(scene);
  const showWebsite   = scene === 'website';

  // Dark overlay opacity
  const darkOpacity =
    ['fade-black', 'gift-card', 'gift-ready', 'credits'].includes(scene) ? 0.80
    : scene === 'rose-grow'     ? 0.12
    : scene === 'rose-bloom'    ? 0.08
    : scene === 'final-message' ? 0.28
    : scene === 'done'          ? 0.85
    : 0;

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0" style={{
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 20% 80%, rgba(80,50,140,0.15) 0%, transparent 45%), ' +
          'linear-gradient(180deg, hsl(240,20%,4%) 0%, hsl(240,10%,2%) 100%)',
      }} />

      {/* ── Bokeh ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {BOKEH.map((b, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, background: 'rgba(212,175,55,0.4)' }}
            animate={{ opacity: [0.1, 0.35, 0.1], scale: [1, 1.6, 1] }}
            transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Unified dark overlay ── */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ zIndex: 22 }}
        animate={{ opacity: darkOpacity }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
      />

      {/* ── Memory Jar ── */}
      <AnimatePresence>
        {showJar && (
          <motion.div key="jar" className="absolute flex flex-col items-center justify-center" style={{ zIndex: 20 }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute rounded-full pointer-events-none" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(20px)' }} />
            {(scene === 'stars-float' || scene === 'jar-glow') && STARS_DATA.map(s => (
              <FloatingStar key={s.id} star={s} absorbed={starsAbsorbed} />
            ))}
            <MemoryJar glowing={jarGlowing} />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }} className="handwriting text-primary/50 text-lg mt-4">
              a jar of memories
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Journal ── */}
      <AnimatePresence>
        {showJournal && (
          <motion.div key="journal" className="relative w-full max-w-md mx-4" style={{ zIndex: 20 }}
            initial={{ opacity: 0, scaleY: 0.02, transformOrigin: 'top center' }}
            animate={journalClose ? { opacity: 0, scale: 0.85, filter: 'blur(8px)' } : { opacity: 1, scaleY: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={journalClose ? { duration: 2.5, ease: 'easeInOut' } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -inset-8 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 70%)', filter: 'blur(16px)' }} />
            <ScrapbookPage letterProgress={letterProgress} photoCount={photoCount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          GIFT CARD
          ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 30 }}>
        <div style={{ pointerEvents: showGiftCard ? 'auto' : 'none' }}>
          <GiftCard visible={showGiftCard} showButton={showGiftBtn} onButtonClick={handleGiftButtonClick} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CREDITS — "Made with ❤️ by Anshu" (appears FIRST)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCredits && (
          <motion.div
            key="credits-first"
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Rose emoji glowing above */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 text-5xl select-none"
              style={{ filter: 'drop-shadow(0 0 24px rgba(200,30,60,0.9)) drop-shadow(0 0 48px rgba(200,30,60,0.5))' }}
            >
              🌹
            </motion.div>

            {/* Credit line */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
              className="serif text-3xl tracking-wide text-center"
              style={{
                color: 'rgba(255,235,240,0.97)',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                textShadow:
                  '0 0 30px rgba(220,60,90,0.7), ' +
                  '0 0 60px rgba(200,30,60,0.4), ' +
                  '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Made by Ayush
            </motion.p>

            {/* Subtle tagline below */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ duration: 1.2, delay: 1.2 }}
              className="mt-3 text-sm tracking-[0.25em] uppercase"
              style={{ color: 'rgba(255,200,210,0.7)', fontFamily: "'Inter', sans-serif" }}
            >
              i coded this for you
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          ROSE SCENE — particles + warm light + rose
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRose && (
          <motion.div
            key="rose-scene"
            className="absolute inset-0"
            style={{ zIndex: 28 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: 'easeInOut' }}
          >
            {/* Golden particles from GoldenParticles component */}
            <GoldenParticles active={showParticles} />

            {/* Warm light rising */}
            <WarmLight visible={showWarmLight} />

            {/* Rose — anchored to bottom-center */}
            <motion.div
              className="absolute flex items-end justify-center"
              style={{
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                zIndex: 29,
              }}
              initial={{ opacity: 0, y: 80 }}
              animate={roseVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <RoseBloom visible={roseVisible} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final message ── */}
      <FinalMessage visible={showFinalMsg} />

      {/* ── Second website: starts after the entire rose ending ── */}
      <WebsiteExperience visible={showWebsite} />
    </div>
  );
}

