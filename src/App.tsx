import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Downloads from '@/pages/downloads';

import { Chapter1Welcome } from '@/components/chapters/Chapter1Welcome';
import { Chapter2Puzzle } from '@/components/chapters/Chapter2Puzzle';
import { Chapter3Prank } from '@/components/chapters/Chapter3Prank';
import { Chapter4Quiz } from '@/components/chapters/Chapter4Quiz';
import { Chapter5Transition } from '@/components/chapters/Chapter5Transition';
import { Chapter6MemoryReel } from '@/components/chapters/Chapter6MemoryReel';
import { Chapter7Apology } from '@/components/chapters/Chapter7Apology';
import { Chapter8Confession } from '@/components/chapters/Chapter8Confession';
import { Chapter9Epilogue } from '@/components/chapters/Chapter9Epilogue';
import { MusicPlayer } from '@/components/MusicPlayer';
import { useAudio, type ChapterMood } from '@/hooks/use-audio';

const CHAPTER_MOODS: Record<number, ChapterMood> = {
  1: 'welcome',
  2: 'arcade',
  3: 'suspense',
  4: 'cheerful',
  5: 'gentle',
  6: 'emotional',
  7: 'gentle',
  8: 'confession',
  9: 'emotional',
};

const TOTAL_CHAPTERS = 9;

function App() {
  const [chapter, setChapter] = useState(1);
  const audio = useAudio();

  const nextChapter = useCallback(() => {
    setChapter(prev => Math.min(prev + 1, TOTAL_CHAPTERS));
  }, []);

  // Unlock audio on first interaction anywhere
  const handleFirstInteraction = useCallback(() => {
    if (!audio.isUnlocked) {
      audio.unlockAudio();
    }
  }, [audio]);

  // Chapter 9 has its own replaceable piano track. Every other chapter keeps
  // the original synthesized mood music.
  useEffect(() => {
    if (!audio.isUnlocked) return;
    if (chapter === 9) {
      audio.playChapter9Piano();
      return;
    }
    const mood = CHAPTER_MOODS[chapter];
    if (mood) audio.playMood(mood);
  }, [chapter, audio.isUnlocked, audio.playChapter9Piano, audio.playMood]);

  const renderChapter = () => {
    switch (chapter) {
      case 1:
        return (
          <Chapter1Welcome
            key="ch1"
            onComplete={nextChapter}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 2:
        return (
          <Chapter2Puzzle
            key="ch2"
            onComplete={nextChapter}
            playMatchSfx={audio.playMatchSfx}
            playMismatchSfx={audio.playMismatchSfx}
            playVictorySfx={audio.playVictorySfx}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 3:
        return (
          <Chapter3Prank
            key="ch3"
            onComplete={nextChapter}
            playPrankRevealSfx={audio.playPrankRevealSfx}
          />
        );
      case 4:
        return (
          <Chapter4Quiz
            key="ch4"
            onComplete={nextChapter}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 5:
        return (
          <Chapter5Transition
            key="ch5"
            onComplete={nextChapter}
            playTypingSfx={audio.playTypingSfx}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 6:
        return (
          <Chapter6MemoryReel
            key="ch6"
            onComplete={nextChapter}
            playTypingSfx={audio.playTypingSfx}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 7:
        return (
          <Chapter7Apology
            key="ch7"
            onComplete={nextChapter}
            playTypingSfx={audio.playTypingSfx}
            playClickSfx={audio.playClickSfx}
          />
        );
      case 8:
        return (
          <Chapter8Confession
            key="ch8"
            playTypingSfx={audio.playTypingSfx}
            playBirthdaySfx={audio.playBirthdaySfx}
            onComplete={nextChapter}
          />
        );
      case 9:
        return (
          <Chapter9Epilogue
            key="ch9"
            fadeOutAudio={audio.pause}
            playGiftReadySfx={audio.playGiftReadySfx}
            playTulipBloomSfx={audio.playTulipBloomSfx}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-background text-foreground min-h-[100dvh] w-full overflow-x-hidden"
      onClick={handleFirstInteraction}
    >
      {/* Chapter Transition Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter}
          initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.02 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="w-full min-h-[100dvh]"
        >
          {renderChapter()}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots — show dots 1-9, hide on epilogue */}
      {chapter < 9 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 z-50 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={
                i + 1 === chapter
                  ? { scale: 1.5, opacity: 1 }
                  : i + 1 < chapter
                    ? { scale: 1, opacity: 0.4 }
                    : { scale: 1, opacity: 0.1 }
              }
              transition={{ duration: 0.4, type: 'spring' }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          ))}
        </div>
      )}

      {/* Floating music player */}
      <MusicPlayer
        isPlaying={audio.isPlaying}
        isMuted={audio.isMuted}
        volume={audio.volume}
        isUnlocked={audio.isUnlocked}
        onTogglePlay={() => (audio.isPlaying ? audio.pause() : audio.resume())}
        onToggleMute={() => audio.setMuted(!audio.isMuted)}
        onVolumeChange={audio.setVolume}
      />
    </div>
  );
}

function AppRoot() {
  const isDownloads = window.location.pathname.replace(import.meta.env.BASE_URL, '').replace(/^\//, '') === 'downloads';
  if (isDownloads) return <Downloads />;
  return <App />;
}

export default AppRoot;
