import React from 'react';
import { motion } from 'framer-motion';

interface WarmLightProps {
  visible: boolean;
}

export function WarmLight({ visible }: WarmLightProps) {
  return (
    <>
      {/* Ground glow — golden halo rising from the stem base */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: '8%',
          left: '50%',
          translateX: '-50%',
          width: '640px',
          height: '320px',
          background:
            'radial-gradient(ellipse at center bottom, rgba(212,175,55,0.38) 0%, rgba(212,130,60,0.14) 38%, transparent 68%)',
          filter: 'blur(48px)',
          transformOrigin: 'center bottom',
        }}
        initial={{ opacity: 0, scaleX: 0.2, scaleY: 0.3 }}
        animate={visible ? { opacity: 1, scaleX: 1, scaleY: 1 } : { opacity: 0, scaleX: 0.2, scaleY: 0.3 }}
        transition={{ duration: 3.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Ambient upper fill — subtle warm room light */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, rgba(212,175,55,0.11) 0%, rgba(180,120,40,0.04) 45%, transparent 68%)',
        }}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 4.5, delay: 1.2, ease: 'easeOut' }}
      />

      {/* Soft rim light at very bottom of screen */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background:
            'linear-gradient(to top, rgba(212,175,55,0.18) 0%, transparent 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 3, delay: 0.5, ease: 'easeOut' }}
      />
    </>
  );
}
