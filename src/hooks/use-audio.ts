import { useRef, useState, useCallback } from 'react';

export type ChapterMood =
  | 'welcome'
  | 'arcade'
  | 'suspense'
  | 'cheerful'
  | 'emotional'
  | 'gentle'
  | 'confession';

// ─────────────────────────────────────────────────────────────────
// SOUND CONFIG — Edit this object to swap sounds without breaking
// anything. Each key maps to a function that accepts an AudioContext
// and master GainNode and plays the sound via the Web Audio API.
// All synthesis is procedural (no external files needed) but you can
// replace any function with one that loads and plays an AudioBuffer.
// ─────────────────────────────────────────────────────────────────

// Note frequencies (Hz)
const N: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
};

interface MoodConfig {
  melody: number[];
  bass: number;
  tempo: number; // ms per note
  wave: OscillatorType;
  vol: number;
}

const MOODS: Record<ChapterMood, MoodConfig> = {
  welcome: {
    melody: [N.C5, N.E5, N.G5, N.E5, N.C5, N.G4, N.A4, N.C5],
    bass: N.C3,
    tempo: 950,
    wave: 'sine',
    vol: 0.12,
  },
  arcade: {
    melody: [N.C5, N.G5, N.E5, N.C5, N.D5, N.G5, N.F5, N.D5, N.E5, N.G5, N.C5, N.E5],
    bass: N.C4,
    tempo: 200,
    wave: 'triangle',
    vol: 0.18,
  },
  suspense: {
    melody: [N.A3, N.C4, N.Eb4, N.G4, N.Bb4, N.G4, N.Eb4, N.C4],
    bass: N.A3,
    tempo: 700,
    wave: 'sawtooth',
    vol: 0.09,
  },
  cheerful: {
    melody: [N.G4, N.B4, N.D5, N.G5, N.D5, N.B4, N.G4, N.A4, N.B4, N.D5],
    bass: N.G3,
    tempo: 380,
    wave: 'triangle',
    vol: 0.18,
  },
  emotional: {
    melody: [N.F4, N.A4, N.C5, N.A4, N.F4, N.G4, N.A4, N.C5, N.E5, N.C5],
    bass: N.F3,
    tempo: 1600,
    wave: 'sine',
    vol: 0.15,
  },
  gentle: {
    melody: [N.D4, N.F4, N.A4, N.F4, N.D4, N.E4, N.F4, N.A4],
    bass: N.D3,
    tempo: 2200,
    wave: 'sine',
    vol: 0.11,
  },
  confession: {
    melody: [N.C4, N.E4, N.G4, N.B4, N.C5, N.B4, N.G4, N.E4, N.C4, N.E4, N.G4, N.A4],
    bass: N.C3,
    tempo: 1900,
    wave: 'sine',
    vol: 0.17,
  },
};

// ─────────────────────────────────────────────────────────────────
// Low-level helpers
// ─────────────────────────────────────────────────────────────────

function scheduleNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  wave: OscillatorType,
  volume: number,
  activeSources?: Set<OscillatorNode>,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);

  osc.type = wave;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
  gain.gain.setValueAtTime(volume, startTime + duration * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
  if (activeSources) {
    activeSources.add(osc);
    osc.addEventListener('ended', () => activeSources.delete(osc), { once: true });
  }
}

function scheduleBass(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  activeSources?: Set<OscillatorNode>,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.5);
  gain.gain.setValueAtTime(volume * 0.6, startTime + duration - 1);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
  if (activeSources) {
    activeSources.add(osc);
    osc.addEventListener('ended', () => activeSources.delete(osc), { once: true });
  }
}

// ─────────────────────────────────────────────────────────────────
// SOUND CONFIG — swap individual effects here
// Each entry is a function: (ctx, dest, vol) => void
//
// To replace any sound with a file, use:
//   const buf = await ctx.decodeAudioData(await fetch('/sounds/my-sfx.mp3').then(r => r.arrayBuffer()));
//   const src = ctx.createBufferSource(); src.buffer = buf;
//   src.connect(dest); src.start();
// ─────────────────────────────────────────────────────────────────
export const SOUND_CONFIG = {
  /** Played when two memory puzzle cards match */
  matchSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    scheduleNote(ctx, dest, N.G5, ctx.currentTime, 0.12, 'sine', 0.35);
    scheduleNote(ctx, dest, N.C5, ctx.currentTime + 0.1, 0.18, 'sine', 0.25);
  },

  /** Played when two cards do NOT match */
  mismatchSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    scheduleNote(ctx, dest, N.Eb4, ctx.currentTime, 0.1, 'sawtooth', 0.12);
    scheduleNote(ctx, dest, N.D4, ctx.currentTime + 0.08, 0.12, 'sawtooth', 0.10);
  },

  /** Played when the puzzle is fully solved */
  victorySfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    const melody = [N.C5, N.E5, N.G5, N.C5 * 2];
    melody.forEach((freq, i) => {
      scheduleNote(ctx, dest, freq, ctx.currentTime + i * 0.12, 0.2, 'sine', 0.3);
    });
    // Extra shimmer layer
    [N.E5, N.G5, N.A5].forEach((freq, i) => {
      scheduleNote(ctx, dest, freq, ctx.currentTime + 0.5 + i * 0.1, 0.15, 'triangle', 0.15);
    });
  },

  /** Played when the prank reveal happens */
  prankRevealSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    const melody = [N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.E5, N.G5];
    melody.forEach((freq, i) => {
      scheduleNote(ctx, dest, freq, ctx.currentTime + i * 0.08, 0.15, 'triangle', 0.28);
    });
  },

  /** Soft key-press tick for typewriter effects */
  typingSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    // Slightly randomise pitch so it sounds like a real keyboard
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },

  /** Satisfying click for UI button presses */
  clickSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    // Soft thud + high tick
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(dest);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.06);
    g1.gain.setValueAtTime(0.18, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(dest);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1400, ctx.currentTime);
    g2.gain.setValueAtTime(0.08, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.05);
  },

  /** Grand birthday fanfare for the final screen */
  birthdaySfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    // Happy Birthday melody (first phrase)
    const bdMelody = [
      { f: N.C5, t: 0.0, d: 0.25 },
      { f: N.C5, t: 0.25, d: 0.12 },
      { f: N.D5, t: 0.37, d: 0.5 },
      { f: N.C5, t: 0.87, d: 0.5 },
      { f: N.F5, t: 1.37, d: 0.5 },
      { f: N.E5, t: 1.87, d: 1.0 },
      { f: N.C5, t: 3.0, d: 0.25 },
      { f: N.C5, t: 3.25, d: 0.12 },
      { f: N.D5, t: 3.37, d: 0.5 },
      { f: N.C5, t: 3.87, d: 0.5 },
      { f: N.G5, t: 4.37, d: 0.5 },
      { f: N.F5, t: 4.87, d: 1.0 },
    ];
    bdMelody.forEach(({ f, t, d }) => {
      scheduleNote(ctx, dest, f, ctx.currentTime + t, d * 0.85, 'sine', 0.32);
    });
    // Bass accompaniment
    [N.C3, N.F3, N.C3, N.G3].forEach((f, i) => {
      scheduleBass(ctx, dest, f, ctx.currentTime + i * 1.5, 1.2, 0.2);
    });
  },

  // ─── NEW ENDING SFX ───────────────────────────────────────────

  /**
   * Gentle ascending chime — plays when "Open Final Gift" button appears.
   * Replace with a chime/bell audio file for a richer sound.
   */
  giftReadySfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    const notes = [N.G4, N.B4, N.D5, N.G5, N.B4 * 2];
    notes.forEach((freq, i) => {
      scheduleNote(ctx, dest, freq, ctx.currentTime + i * 0.18, 0.38, 'sine', 0.20 - i * 0.02);
    });
    // Lingering shimmer overtone
    scheduleNote(ctx, dest, N.G5 * 2, ctx.currentTime + 0.9, 0.6, 'sine', 0.06);
  },

  /**
   * Magical blooming arpeggio — plays when the tulip begins to open.
   * Replace with a harp glissando or orchestral swell for a cinematic feel.
   */
  tulipBloomSfx: (ctx: AudioContext, dest: AudioNode, _vol: number) => {
    const magic = [N.F4, N.A4, N.C5, N.E5, N.G5, N.A5, N.C5 * 2];
    magic.forEach((freq, i) => {
      scheduleNote(ctx, dest, freq, ctx.currentTime + i * 0.28, 0.55, 'sine', 0.18 - i * 0.01);
      // Soft harmonic shimmer
      if (i < 5) {
        scheduleNote(
          ctx, dest,
          freq * 1.498, // perfect fifth above
          ctx.currentTime + i * 0.28 + 0.14,
          0.30,
          'sine',
          0.04,
        );
      }
    });
    // Sustained bass note
    scheduleBass(ctx, dest, N.F3, ctx.currentTime, 3.0, 0.14);
  },
};

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────
export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMoodRef = useRef<ChapterMood | null>(null);
  const activeMusicSourcesRef = useRef<Set<OscillatorNode>>(new Set());
  const chapter9PianoRef = useRef<HTMLAudioElement | null>(null);
  const pianoSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const currentTrackRef = useRef<'mood' | 'piano' | null>(null);
  const isMutedRef = useRef(false);
  const volumeRef = useRef(0.7);
  const isPlayingRef = useRef(false);

  const [isMuted, setIsMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const master = ctxRef.current.createGain();
      master.gain.setValueAtTime(volumeRef.current, ctxRef.current.currentTime);
      master.connect(ctxRef.current.destination);
      masterGainRef.current = master;
    }
    return ctxRef.current;
  }, []);

  const stopLoop = useCallback(() => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  }, []);

  const stopScheduledMusic = useCallback(() => {
    activeMusicSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch {
        // An oscillator that has already stopped is safe to ignore.
      }
    });
    activeMusicSourcesRef.current.clear();
  }, []);

  const scheduleMoodLoop = useCallback(
    (mood: ChapterMood, ctx: AudioContext, dest: AudioNode, startTime: number) => {
      if (!isPlayingRef.current) return;
      const config = MOODS[mood];
      const noteDur = config.tempo / 1000;
      const totalDur = config.melody.length * noteDur;

      config.melody.forEach((freq, i) => {
        scheduleNote(
          ctx,
          dest,
          freq,
          startTime + i * noteDur,
          noteDur * 0.85,
          config.wave,
          config.vol,
          activeMusicSourcesRef.current,
        );
      });
      scheduleBass(ctx, dest, config.bass, startTime, totalDur, config.vol, activeMusicSourcesRef.current);

      const msUntilNext = (totalDur - 0.1) * 1000;
      loopTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current && currentMoodRef.current === mood) {
          scheduleMoodLoop(mood, ctx, dest, ctx.currentTime + 0.1);
        }
      }, msUntilNext);
    },
    [],
  );

  const playMood = useCallback(
    (mood: ChapterMood) => {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const dest = masterGainRef.current!;

      stopLoop();
      const piano = chapter9PianoRef.current;
      if (piano) {
        piano.pause();
        piano.currentTime = 0;
      }
      stopScheduledMusic();
      currentMoodRef.current = mood;
      currentTrackRef.current = 'mood';
      isPlayingRef.current = true;
      setIsPlayingState(true);
      setIsUnlocked(true);

      if (masterGainRef.current) {
        masterGainRef.current.gain.setValueAtTime(
          masterGainRef.current.gain.value,
          ctx.currentTime,
        );
        masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => {
          if (!masterGainRef.current) return;
          const v = isMutedRef.current ? 0 : volumeRef.current;
          masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
          masterGainRef.current.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.8);
          scheduleMoodLoop(mood, ctx, masterGainRef.current, ctx.currentTime + 0.1);
        }, 420);
      }
    },
    [getCtx, stopLoop, scheduleMoodLoop, stopScheduledMusic],
  );

  const pause = useCallback(() => {
    stopLoop();
    isPlayingRef.current = false;
    setIsPlayingState(false);
    if (currentTrackRef.current === 'piano') {
      chapter9PianoRef.current?.pause();
    }
    stopScheduledMusic();
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }
  }, [stopLoop, stopScheduledMusic]);

  const resume = useCallback(() => {
    if (currentTrackRef.current === 'piano' && chapter9PianoRef.current) {
      const piano = chapter9PianoRef.current;
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      piano.play().then(() => {
        isPlayingRef.current = true;
        setIsPlayingState(true);
      }).catch(() => {
        // The optional file may not have been added yet.
      });
      return;
    }
    if (currentMoodRef.current) {
      playMood(currentMoodRef.current);
    }
  }, [getCtx, playMood]);

  const playChapter9Piano = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const master = masterGainRef.current;
    if (!master) return;

    stopLoop();
    stopScheduledMusic();
    currentMoodRef.current = null;
    currentTrackRef.current = 'piano';
    isPlayingRef.current = false;
    setIsPlayingState(false);

    let piano = chapter9PianoRef.current;
    if (!piano) {
      piano = new Audio(`${import.meta.env.BASE_URL}audio/chapter9-piano.mp3`);
      piano.preload = 'auto';
      piano.loop = true;
      piano.addEventListener('error', () => {
        // The track is intentionally optional until the owner supplies it.
        isPlayingRef.current = false;
        setIsPlayingState(false);
      });
      chapter9PianoRef.current = piano;
      pianoSourceRef.current = ctx.createMediaElementSource(piano);
      pianoSourceRef.current.connect(master);
    }

    const startPiano = () => {
      if (!chapter9PianoRef.current) return;
      chapter9PianoRef.current.play().then(() => {
        isPlayingRef.current = true;
        setIsPlayingState(true);
      }).catch(() => {
        // Missing audio files and browser autoplay restrictions are non-fatal.
      });
    };

    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45);
    window.setTimeout(() => {
      if (!chapter9PianoRef.current || currentTrackRef.current !== 'piano') return;
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        isMutedRef.current ? 0 : volumeRef.current,
        ctx.currentTime + 0.9,
      );
      startPiano();
    }, 480);
    setIsUnlocked(true);
  }, [getCtx, stopLoop, stopScheduledMusic]);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    setIsMutedState(muted);
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(muted ? 0 : volumeRef.current, ctx.currentTime + 0.3);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (ctx && master && !isMutedRef.current) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
    }
  }, []);

  // Generic SFX dispatcher — uses SOUND_CONFIG so swapping sounds is easy
  const playSfx = useCallback(
    (sfxKey: keyof typeof SOUND_CONFIG) => {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (!masterGainRef.current) return;
      SOUND_CONFIG[sfxKey](ctx, masterGainRef.current, volumeRef.current);
    },
    [getCtx],
  );

  const playMatchSfx       = useCallback(() => playSfx('matchSfx'),       [playSfx]);
  const playMismatchSfx    = useCallback(() => playSfx('mismatchSfx'),    [playSfx]);
  const playVictorySfx     = useCallback(() => playSfx('victorySfx'),     [playSfx]);
  const playPrankRevealSfx = useCallback(() => playSfx('prankRevealSfx'), [playSfx]);
  const playTypingSfx      = useCallback(() => playSfx('typingSfx'),      [playSfx]);
  const playClickSfx       = useCallback(() => playSfx('clickSfx'),       [playSfx]);
  const playBirthdaySfx    = useCallback(() => playSfx('birthdaySfx'),    [playSfx]);
  // NEW
  const playGiftReadySfx   = useCallback(() => playSfx('giftReadySfx'),   [playSfx]);
  const playTulipBloomSfx  = useCallback(() => playSfx('tulipBloomSfx'),  [playSfx]);

  const unlockAudio = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    setIsUnlocked(true);
  }, [getCtx]);

  return {
    playMood,
    playChapter9Piano,
    pause,
    resume,
    setMuted,
    setVolume,
    playMatchSfx,
    playMismatchSfx,
    playVictorySfx,
    playPrankRevealSfx,
    playTypingSfx,
    playClickSfx,
    playBirthdaySfx,
    playGiftReadySfx,
    playTulipBloomSfx,
    unlockAudio,
    isMuted,
    volume,
    isPlaying,
    isUnlocked,
  };
}
