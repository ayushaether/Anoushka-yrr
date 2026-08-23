import React from 'react';
import { motion } from 'framer-motion';

interface FinalMessageProps {
  visible: boolean;
}

export function FinalMessage({ visible }: FinalMessageProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 36 }}
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 3.5, ease: 'easeInOut' }}
    >
      {/* Backdrop gradient so text reads over the tulip */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(5,3,12,0.65) 0%, transparent 62%)',
        }}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />

      {/* Text block */}
      <motion.div
        className="relative text-center px-8"
        style={{ marginTop: '-80px' }}
        initial={{ y: 22, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : { y: 22, opacity: 0 }}
        transition={{ duration: 3, delay: 0.6, ease: 'easeOut' }}
      >
        <p
          className="serif"
          style={{
            color: 'rgba(212,175,55,0.88)',
            fontSize: 'clamp(1.25rem, 4.5vw, 1.9rem)',
            fontStyle: 'italic',
            letterSpacing: '0.045em',
            lineHeight: 1.55,
            textShadow:
              '0 0 32px rgba(212,175,55,0.45), 0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          Some memories don't fade.
        </p>

        <motion.p
          className="serif mt-3"
          style={{
            color: 'rgba(212,175,55,0.78)',
            fontSize: 'clamp(1.25rem, 4.5vw, 1.9rem)',
            fontStyle: 'italic',
            letterSpacing: '0.045em',
            lineHeight: 1.55,
            textShadow:
              '0 0 32px rgba(212,175,55,0.45), 0 2px 8px rgba(0,0,0,0.6)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 2.8, delay: 2.2, ease: 'easeOut' }}
        >
          They simply bloom.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
