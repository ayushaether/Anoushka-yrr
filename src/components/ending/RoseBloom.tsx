import { useEffect, useRef, useState } from 'react';

// ─── Petal layer data (8 layers, 68 petals total vs reference's 49) ──────────

const PETAL_LAYERS = [
  { count: 5,  w: 22,  h: 44,  curl: 84,  delayBase: 0,    tz: 2,  cls: 'rb-bud' },
  { count: 6,  w: 32,  h: 58,  curl: 70,  delayBase: 0.22, tz: 11, cls: 'rb-core' },
  { count: 7,  w: 44,  h: 72,  curl: 53,  delayBase: 0.48, tz: 21, cls: 'rb-inner' },
  { count: 8,  w: 56,  h: 88,  curl: 34,  delayBase: 0.82, tz: 33, cls: 'rb-mid-inner' },
  { count: 9,  w: 70,  h: 104, curl: 12,  delayBase: 1.24, tz: 47, cls: 'rb-mid' },
  { count: 10, w: 84,  h: 118, curl: -14, delayBase: 1.70, tz: 63, cls: 'rb-outer' },
  { count: 11, w: 96,  h: 130, curl: -36, delayBase: 2.20, tz: 79, cls: 'rb-blush' },
  { count: 12, w: 108, h: 140, curl: -58, delayBase: 2.74, tz: 93, cls: 'rb-guard' },
] as const;

// Pre-generated stable petal data (no randomness, deterministic from indices)
const PETALS = PETAL_LAYERS.flatMap((L, li) =>
  Array.from({ length: L.count }, (_, i) => ({
    key: `${li}-${i}`,
    layer: L,
    angle: li * 22.5 + i * (360 / L.count) + (((li * 17 + i * 31) % 10) - 5) * 0.45,
    delay: L.delayBase + i * 0.048,
    curl: L.curl + (((li * 13 + i * 7) % 6) - 3),
    scale: 0.93 + ((li * 7 + i * 11) % 12) * 0.01,
    dur: 2.1 + ((li * 3 + i * 5) % 8) * 0.05,
  }))
);

const SEPALS = Array.from({ length: 5 }, (_, i) => ({
  angle: i * 72 + (i * 17 % 10 - 5) * 0.5,
  delay: 0.3 + i * 0.06,
  curl: 18 + i * 7 % 8,
}));

const FALL_COLORS = ['#9a001d', '#850018', '#ad0022', '#bf0028', '#c50030'] as const;

const FALLING = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: 8 + (i * 4.1) % 84,
  top: 1 + (i * 3.9) % 16,
  w: 7 + (i * 2) % 14,
  c1: FALL_COLORS[i % FALL_COLORS.length],
  c2: ['#3d0008','#2b0005','#480008','#52000c','#5a000e'][i % 5],
  dur: 5.5 + (i * 0.38) % 3.5,
  delay: (i * 0.62) % 5.5,
  s1: (i % 2 === 0 ? 1 : -1) * (12 + (i * 3) % 28),
  s2: (i % 3 === 0 ? -1 : 1) * (8 + (i * 4) % 24),
  s3: (i % 2 === 0 ? 1 : -1) * (16 + (i * 2) % 32),
  s4: (i % 3 === 0 ? 1 : -1) * (6 + (i * 5) % 18),
}));

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { visible: boolean }

export function RoseBloom({ visible }: Props) {
  const [stemGrown, setStemGrown] = useState(false);
  const [leafL,     setLeafL]     = useState(false);
  const [leafR,     setLeafR]     = useState(false);
  const [calyxOn,   setCalyxOn]   = useState(false);
  const [blooming,  setBlooming]  = useState(false);
  const [rotating,  setRotating]  = useState(false);
  const [falling,   setFalling]   = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!visible) return;
    const add = (fn: () => void, ms: number) =>
      timers.current.push(setTimeout(fn, ms));

    add(() => setStemGrown(true), 80);
    add(() => setLeafL(true),     860);
    add(() => setLeafR(true),    1160);
    add(() => setCalyxOn(true),  2180);
    add(() => setBlooming(true), 2360);
    add(() => setRotating(true), 5500);
    add(() => setFalling(true),  6600);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [visible]);

  return (
    <>
      {/* ── Injected CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: ROSE_CSS }} />

      {/* ── Ambient rose glow fill ── */}
      <div className={`rb-ambient${blooming ? ' rb-on' : ''}`} />

      {/* ── Falling petals (absolute, spans full parent) ── */}
      {falling && FALLING.map(p => (
        <div
          key={p.id}
          className="rb-fall"
          style={{
            left: `${p.left}%`,
            top:  `${p.top}%`,
            '--fp-w':    `${p.w}px`,
            '--fp-h':    `${p.w * 1.35}px`,
            '--fp-c1':   p.c1,
            '--fp-c2':   p.c2,
            '--f-dur':   `${p.dur}s`,
            '--f-delay': `${p.delay}s`,
            '--s1':      `${p.s1}px`,
            '--s2':      `${p.s2}px`,
            '--s3':      `${p.s3}px`,
            '--s4':      `${p.s4}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── 3-D scene ── */}
      <div className="rb-scene">
        <div className={`rb-wrap${rotating ? ' rb-rotating' : ''}`}>

          {/* Stem + thorns + leaves */}
          <div className="rb-stem-group">
            <div className={`rb-stem${stemGrown ? ' rb-grow' : ''}`}>
              <div className="rb-stem-hi" />
            </div>
            <div className="rb-thorn rb-thorn1" />
            <div className="rb-thorn rb-thorn2" />
            <div className={`rb-leaf rb-leaf-l${leafL ? ' rb-lv' : ''}`}>
              <div className="rb-vein" />
            </div>
            <div className={`rb-leaf rb-leaf-r${leafR ? ' rb-lv' : ''}`}>
              <div className="rb-vein" />
            </div>
          </div>

          {/* Calyx / sepals */}
          <div className={`rb-calyx${calyxOn ? ' rb-cv' : ''}`}>
            {SEPALS.map((s, i) => (
              <div
                key={i}
                className="rb-sepal"
                style={{
                  '--sa': `${s.angle}deg`,
                  '--sc': `${s.curl}deg`,
                  '--sd': `${s.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Rose head (petals live here) */}
          <div className={`rb-head${blooming ? ' rb-blooming' : ''}`}>
            <div className="rb-glow1" />
            <div className="rb-glow2" />
            <div className="rb-glow3" />
            <div className="rb-center-gem" />

            {PETALS.map(p => (
              <div
                key={p.key}
                className={`rb-petal ${p.layer.cls}`}
                style={{
                  width:  `${p.layer.w}px`,
                  height: `${p.layer.h}px`,
                  '--a':  `${p.angle}deg`,
                  '--c':  `${p.curl}deg`,
                  '--s':  p.scale,
                  '--d':  `${p.delay}s`,
                  '--z':  `${p.layer.tz}px`,
                  '--bd': `${p.dur}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Injected CSS (scoped with rb- prefix) ────────────────────────────────────

const ROSE_CSS = `
/* Ambient fill that appears when blooming */
.rb-ambient {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 38%,
    rgba(200,10,50,0.13) 0%, rgba(140,0,30,0.05) 42%, transparent 66%);
  opacity: 0; transition: opacity 3.2s ease; z-index: 0;
}
.rb-ambient.rb-on { opacity: 1; }

/* Falling petal drift */
.rb-fall {
  position: absolute;
  width: var(--fp-w, 12px); height: var(--fp-h, 16px);
  background: radial-gradient(ellipse at 40% 30%, var(--fp-c1, #9a001d), var(--fp-c2, #3d0008) 75%);
  border-radius: 50% 50% 45% 55% / 60% 60% 40% 40%;
  opacity: 0; pointer-events: none; z-index: 5;
  animation: rb-fall var(--f-dur, 7s) ease-in var(--f-delay, 0s) infinite;
  will-change: transform, opacity;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45));
}
@keyframes rb-fall {
  0%   { opacity:0;    transform:translateX(0)              translateY(0)    rotate(0deg)   rotateY(0deg)   scale(1);    }
  8%   { opacity:0.88; }
  25%  {               transform:translateX(var(--s1,30px)) translateY(18vh) rotate(65deg)  rotateY(35deg)  scale(0.95); }
  50%  {               transform:translateX(var(--s2,-22px))translateY(44vh) rotate(155deg) rotateY(88deg)  scale(0.87); opacity:0.65; }
  75%  {               transform:translateX(var(--s3,28px)) translateY(72vh) rotate(265deg) rotateY(148deg) scale(0.74); opacity:0.40; }
  100% { opacity:0;    transform:translateX(var(--s4,8px))  translateY(106vh)rotate(390deg) rotateY(210deg) scale(0.48); }
}

/* 3-D perspective scene */
.rb-scene {
  perspective: 1200px; perspective-origin: 50% 33%;
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
   padding-bottom: clamp(1rem, 5vh, 3rem);
   overflow: visible;
}

.rb-wrap {
  transform-style: preserve-3d; position: relative;
   width: clamp(210px, 52vw, 300px);
   height: clamp(350px, 74vh, 490px);
   transform-origin: 50% 100%;
  transform: rotateX(-22deg) rotateY(0deg);
  will-change: transform;
}
.rb-wrap.rb-rotating { animation: rb-rotate 32s linear infinite; }
@keyframes rb-rotate {
  from { transform: rotateX(-22deg) rotateY(0deg);   }
  to   { transform: rotateX(-22deg) rotateY(360deg); }
}

/* ── Stem ── */
.rb-stem-group {
  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
   width: 12px;
   height: clamp(195px, 39vh, 255px);
   z-index: 5;
   transform-style: preserve-3d;
}
.rb-stem {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 0%;
  background: linear-gradient(to top, #071e0c 0%, #0d3a1a 28%, #175e2c 68%, #0d3a1a 100%);
  border-radius: 5px;
  transition: height 2.2s cubic-bezier(0.22,1,0.36,1);
  overflow: hidden; will-change: height;
}
.rb-stem.rb-grow { height: 100%; }
.rb-stem-hi {
  position: absolute; top: 0; left: 1.5px; width: 2px; height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(160,255,190,0.20), transparent);
}

/* Thorns */
.rb-thorn { position: absolute; width: 12px; height: 7px; opacity: 0; transition: opacity 0.5s ease 0.6s; z-index: 2; }
.rb-thorn::before {
  content:''; position: absolute; width:100%; height:100%;
  background: linear-gradient(135deg,#175e2c,#071e0c);
  clip-path: polygon(0% 85%, 100% 50%, 30% 0%);
}
.rb-thorn1 { right:-10px; bottom:65%; transform:scaleX(-1); }
.rb-thorn2 { left:-10px;  bottom:40%; }
.rb-stem.rb-grow ~ .rb-thorn { opacity: 0.72; }

/* Leaves */
.rb-leaf {
  position: absolute; width: 58px; height: 27px;
  opacity: 0; transition: opacity 0.6s ease, transform 1.2s cubic-bezier(0.34,1.45,0.64,1);
  z-index: 2; will-change: transform, opacity;
}
.rb-leaf::before {
  content:''; position:absolute; width:100%; height:100%;
  background: linear-gradient(160deg, #2d9e52 0%, #1a6f35 42%, #092e12 100%);
  border-radius: 2px 65% 2px 65%;
}
.rb-vein {
  position: absolute; width: 58%; height: 1px;
  background: rgba(160,255,190,0.16); top: 48%; left: 20%; z-index:1;
}
.rb-leaf-l { left:-58px; bottom:56%; transform-origin:right center; transform:rotate(36deg) scale(0); }
.rb-leaf-l::before { border-radius: 65% 2px 65% 2px; }
.rb-leaf-r { left:10px;  bottom:38%; transform-origin:left center;  transform:rotate(-36deg) scale(0); }
.rb-leaf.rb-lv { opacity:1; }
.rb-leaf-l.rb-lv { transform:rotate(15deg) scale(1); }
.rb-leaf-r.rb-lv { transform:rotate(-15deg) scale(1); }

/* ── Calyx / Sepals ── */
.rb-calyx {
   position:absolute; bottom:clamp(193px, 38.5vh, 248px); left:50%; transform:translateX(-50%);
   width:0; height:0; transform-style:preserve-3d; z-index:11;
}
.rb-sepal {
  position:absolute; bottom:-4px; left:50%;
  width:15px; height:36px; transform-origin:50% 100%;
  background: linear-gradient(to top, #071e0c 0%, #124c21 40%, #278c44 100%);
  border-radius: 50% 50% 10% 10% / 80% 80% 20% 20%;
  clip-path: polygon(10% 100%, 0% 30%, 50% 0%, 100% 30%, 90% 100%);
  opacity:0;
  transform: translateX(-50%) rotateY(var(--sa,0deg)) rotateX(64deg) scale(0.5);
  transition:
    transform 1.4s cubic-bezier(0.25,1,0.5,1) var(--sd,0s),
    opacity   0.5s ease var(--sd,0s);
  will-change: transform, opacity;
}
.rb-calyx.rb-cv .rb-sepal {
  opacity: 0.95;
  transform: translateX(-50%) rotateY(var(--sa,0deg)) rotateX(var(--sc,22deg)) scale(1);
}

/* ── Rose head ── */
.rb-head {
   position:absolute; bottom:clamp(197px, 39vh, 252px); left:50%;
  transform: translateX(-50%);
   width:0; height:0; transform-style:preserve-3d; z-index:12;
}

/* Multi-layer glow */
.rb-glow1,.rb-glow2,.rb-glow3 {
  position:absolute; border-radius:50%;
  top:50%; left:50%; transform:translate(-50%,-50%);
  opacity:0; pointer-events:none; z-index:-1;
}
.rb-glow1 { width:440px; height:440px; background:radial-gradient(circle, rgba(160,5,30,0.22) 0%, rgba(100,0,20,0.06) 44%, transparent 66%); transition:opacity 3.5s ease; }
.rb-glow2 { width:230px; height:230px; background:radial-gradient(circle, rgba(200,40,70,0.20) 0%, transparent 66%); transition:opacity 2.2s ease 0.7s; }
.rb-glow3 { width:110px; height:110px; background:radial-gradient(circle, rgba(255,110,140,0.28) 0%, transparent 66%); transition:opacity 1.6s ease 1.5s; }
.rb-head.rb-blooming .rb-glow1 { opacity:1; }
.rb-head.rb-blooming .rb-glow2 { opacity:1; }
.rb-head.rb-blooming .rb-glow3 { opacity:1; }

/* Stamen gem */
.rb-center-gem {
  position:absolute; width:20px; height:20px; border-radius:50%;
  background: radial-gradient(circle, rgba(255,215,80,0.95) 0%, rgba(220,90,50,0.65) 55%, transparent 100%);
  top:50%; left:50%; transform:translate(-50%,-50%) translateZ(5px);
  opacity:0; transition:opacity 1.8s ease 3s;
  filter:blur(1.5px); z-index:20;
  box-shadow: 0 0 12px 4px rgba(255,180,60,0.35);
}
.rb-head.rb-blooming .rb-center-gem { opacity:1; }

/* ── Petals ── */
.rb-petal {
  position:absolute; bottom:0; left:50%;
  transform-origin: 50% 100%;
  opacity:0.002; will-change:transform,opacity;
  border-radius: 50% 50% 35% 35% / 48% 48% 52% 52%;
  transform:
    translateX(-50%)
    rotateY(var(--a,0deg))
    translateZ(0px)
    rotateX(88deg)
    scale(0.08);
  transition:
    transform var(--bd,2.4s) ease-in-out var(--d,0s),
    opacity   0.7s ease      var(--d,0s);
}
/* Velvet sheen on each petal */
.rb-petal::after {
  content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: linear-gradient(155deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 45%, transparent 60%);
}
.rb-head.rb-blooming .rb-petal {
  opacity:1;
  transform:
    translateX(-50%)
    rotateY(var(--a,0deg))
    translateZ(var(--z,0px))
    rotateX(var(--c,30deg))
    scale(var(--s,1));
}

/* Petal colours — innermost (almost black-red) → outermost (rich crimson → blush guard) */
.rb-bud       { background: linear-gradient(to bottom, #2d0005 0%, #160002 45%, #080000 75%, #020000 100%); }
.rb-core      { background: linear-gradient(to bottom, #450009 0%, #240004 45%, #0e0001 75%, #040000 100%); }
.rb-inner     { background: linear-gradient(to bottom, #5c000f 0%, #320006 45%, #180002 75%, #070000 100%); }
.rb-mid-inner { background: linear-gradient(to bottom, #730016 0%, #400009 45%, #200003 75%, #090000 100%); }
.rb-mid       { background: linear-gradient(to bottom, #88001a 0%, #4e000d 45%, #280004 75%, #0c0000 100%); }
.rb-outer     { background: linear-gradient(to bottom, #9e001f 0%, #5e0010 45%, #320005 75%, #110000 100%); }
.rb-blush     { background: linear-gradient(to bottom, #bc2448 0%, #a50020 18%, #6e0013 50%, #3c0007 80%, #180001 100%); }
.rb-guard     { background: linear-gradient(to bottom, #cc3860 0%, #bf0028 18%, #7e0016 50%, #440009 80%, #1c0002 100%); }

/* Subtle breathing after full bloom */
@keyframes rb-breath {
  0%,100% { transform: translateX(-50%) scale(1.000); }
  50%      { transform: translateX(-50%) scale(1.018); }
}
.rb-head.rb-blooming { animation: rb-breath 5.5s ease-in-out 5s infinite; }
`;
