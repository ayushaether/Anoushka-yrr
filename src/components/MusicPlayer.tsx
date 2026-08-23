import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isUnlocked: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
}

export function MusicPlayer({
  isPlaying,
  isMuted,
  volume,
  isUnlocked,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
}: MusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 bg-card/80 backdrop-blur-md border border-primary/20 rounded-full px-4 py-2 shadow-lg shadow-black/30"
          >
            {/* Play / Pause */}
            <button
              onClick={onTogglePlay}
              className="text-primary/80 hover:text-primary transition-colors"
              data-testid="music-toggle-play"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (v === 0) {
                  if (!isMuted) onToggleMute();
                } else {
                  if (isMuted) onToggleMute();
                  onVolumeChange(v);
                }
              }}
              className="w-20 accent-primary cursor-pointer"
              data-testid="music-volume"
            />

            {/* Mute toggle */}
            <button
              onClick={onToggleMute}
              className="text-primary/80 hover:text-primary transition-colors"
              data-testid="music-mute"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        onClick={() => setExpanded(p => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className={`relative w-10 h-10 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 ${
          expanded
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card/70 backdrop-blur-md text-primary/70 border-primary/20 hover:border-primary/50 hover:text-primary'
        }`}
        data-testid="music-player-toggle"
        title="Music controls"
      >
        <Music className="w-4 h-4" />
        {/* Playing indicator — animated pulse dot */}
        {isPlaying && !isMuted && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
        )}
      </motion.button>

      {!isUnlocked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
          className="text-xs text-foreground/40 text-right max-w-[100px] leading-tight"
        >
          Tap anywhere for music
        </motion.p>
      )}
    </div>
  );
}
