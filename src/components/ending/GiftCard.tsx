import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Loading messages that cycle while progress bar runs ──
const MESSAGES = [
  'Collecting memories...',
  'Pressing the flower...',
  'Wrapping everything with love...',
  'Almost ready...',
];

const MSG_INTERVAL_MS = 3750;
const MSG_FADE_MS = 500;

interface GiftCardProps {
  /** Whether the whole card scene is active */
  visible: boolean;
  /** When true, hide the bar and show the open button */
  showButton: boolean;
  /** Called when the user clicks "Open Final Gift" */
  onButtonClick: () => void;
}

export function GiftCard({ visible, showButton, onButtonClick }: GiftCardProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgIn, setMsgIn] = useState(true);

  // Rotate loading messages with a cross-fade
  useEffect(() => {
    if (!visible || showButton) return;
    let swapTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setMsgIn(false);
      swapTimer = setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
        setMsgIn(true);
      }, MSG_FADE_MS);
    }, MSG_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (swapTimer !== null) clearTimeout(swapTimer);
    };
  }, [visible, showButton]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="gift-card-root"
          className="relative flex flex-col items-center justify-center"
          style={{ width: '340px', maxWidth: '90vw' }}
          initial={{ opacity: 0, y: 34, scale: 0.90 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.88, filter: 'blur(12px)' }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Floating bokeh dots around the card ── */}
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={`bokeh-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 3 + (i % 4),
                height: 3 + (i % 4),
                background: 'rgba(212,175,55,0.45)',
                left: `${(i * 38.3 + 4) % 108 - 4}%`,
                top: `${(i * 57.1 + 8) % 110 - 5}%`,
              }}
              animate={{
                opacity: [0.08, 0.5, 0.08],
                scale: [1, 1.9, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3.2 + (i % 3) * 0.7,
                repeat: Infinity,
                delay: i * 0.38,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* ── Card body ── */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              background:
                'linear-gradient(145deg, rgba(12,8,22,0.97) 0%, rgba(22,14,42,0.95) 48%, rgba(12,8,26,0.97) 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
              boxShadow:
                '0 32px 90px rgba(0,0,0,0.72), 0 0 48px rgba(212,175,55,0.07), inset 0 1px 0 rgba(212,175,55,0.18)',
              padding: '42px 38px 38px',
            }}
          >
            {/* Shimmer sweep across card surface */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.07) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0%', '-100% 0%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
            />

            {/* Floating gift icon */}
            <motion.div
              className="flex justify-center mb-7"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.05) 100%)',
                  border: '1px solid rgba(212,175,55,0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: '0 0 22px rgba(212,175,55,0.22)',
                }}
              >
                🎁
              </div>
            </motion.div>

            {/* Title */}
            <p
              className="serif text-center mb-8"
              style={{
                color: 'rgba(212,175,55,0.92)',
                fontSize: '1.18rem',
                letterSpacing: '0.04em',
                fontStyle: 'italic',
                textShadow: '0 0 24px rgba(212,175,55,0.35)',
              }}
            >
              Preparing one last gift...
            </p>

            {/* Progress bar — visible only before button */}
            <AnimatePresence>
              {!showButton && (
                <motion.div
                  key="progress-bar"
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      height: '3px',
                      background: 'rgba(212,175,55,0.12)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(212,175,55,0.65) 0%, rgba(255,215,80,0.95) 55%, rgba(212,175,55,0.65) 100%)',
                        boxShadow: '0 0 10px rgba(212,175,55,0.55)',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: 14.5,
                        // Natural non-linear feel: fast → slow → medium → slow → snap
                        ease: [0.18, 0.0, 0.82, 1.0],
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading message / button slot */}
            <div
              className="flex justify-center items-center"
              style={{ minHeight: '56px' }}
            >
              {!showButton ? (
                /* Rotating messages */
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    className="text-center"
                    style={{
                      color: 'rgba(212,175,55,0.52)',
                      fontSize: '0.8rem',
                      letterSpacing: '0.07em',
                      fontFamily: "'Outfit', sans-serif",
                      textTransform: 'uppercase',
                    }}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: msgIn ? 1 : 0, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.5 }}
                  >
                    {MESSAGES[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              ) : (
                /* Gift button */
                <motion.button
                  onClick={onButtonClick}
                  className="serif relative"
                  style={{
                    padding: '15px 38px',
                    borderRadius: '50px',
                    background:
                      'linear-gradient(135deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.08) 100%)',
                    border: '1px solid rgba(212,175,55,0.48)',
                    color: 'rgba(212,175,55,0.96)',
                    fontSize: '1.02rem',
                    fontStyle: 'italic',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    outline: 'none',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: [
                      '0 0 16px rgba(212,175,55,0.22), 0 0 36px rgba(212,175,55,0.08)',
                      '0 0 28px rgba(212,175,55,0.46), 0 0 58px rgba(212,175,55,0.20)',
                      '0 0 16px rgba(212,175,55,0.22), 0 0 36px rgba(212,175,55,0.08)',
                    ],
                  }}
                  transition={{
                    opacity: { duration: 0.9, ease: 'easeOut' },
                    scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                    boxShadow: {
                      duration: 2.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.8,
                    },
                  }}
                  whileHover={{
                    scale: 1.07,
                    boxShadow:
                      '0 0 38px rgba(212,175,55,0.58), 0 0 66px rgba(212,175,55,0.26)',
                    background:
                      'linear-gradient(135deg, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.16) 100%)',
                    border: '1px solid rgba(212,175,55,0.72)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  🌷&nbsp; Open Final Gift
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
