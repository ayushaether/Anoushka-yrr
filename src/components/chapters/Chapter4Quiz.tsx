import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  playClickSfx?: () => void;
}

const QUESTIONS = [
  {
    question: 'Which word describes today?',
    options: ['Magical ✨', 'Chaotic 😂', 'Peaceful 🌸', 'Unexpected 👀'],
    responses: [
      'A magical choice. ✨',
      'Chaos makes the best memories. 😂',
      'Peaceful days are underrated. 🌸',
      'Unexpected... I like surprises. 👀',
    ],
  },
  {
    question: 'Choose your birthday superpower.',
    options: ['Unlimited Cake 🍰', 'Teleport Anywhere 🌍', 'Pause Time ⏳', 'Read Minds 🧠'],
    responses: [
      'Cake first. Priorities. 😌',
      'Free trips forever? Nice!',
      'More birthday time? Smart choice.',
      'Mind reading? That\'s dangerous. 😂',
    ],
  },
  {
    question: 'Which emoji matches you today?',
    options: ['😎', '🥳', '💖', '🤍'],
    responses: [
      'Cool as always.',
      'Party mode activated! 🥳',
      'A soft heart never goes out of style. 💖',
      'Calm and peaceful today. 🤍',
    ],
  },
  {
    question: 'Pick one birthday wish.',
    options: ['Happiness ❤️', 'Adventure ✈️', 'Success 🌟', 'All of them 😌'],
    responses: [
      'You deserve lots of happiness. ❤️',
      'May your adventures be unforgettable! ✈️',
      'Dream big and keep going. 🌟',
      'Best answer. Why choose just one? 😌',
    ],
  },
];

const ANALYSIS_MESSAGES = [
  'Analysing response patterns...',
  'Comparing with 8 billion personalities...',
  'Checking birthday happiness levels...',
  'Searching for someone similar...',
  'Processing uniqueness...',
  'ERROR: No identical personality found.',
];

export function Chapter4Quiz({ onComplete, playClickSfx }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);

  // Run analysis messages cycle
  useEffect(() => {
    if (!isAnalysing) return;

    setDisplayMessage(ANALYSIS_MESSAGES[0]);
    setAnalysisStep(0);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      if (index >= ANALYSIS_MESSAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayMessage('✓ Analysis Complete!');
          setTimeout(() => {
            setIsAnalysing(false);
            setIsFinished(true);
          }, 600);
        }, 200);
        return;
      }
      setAnalysisStep(index);
      setDisplayMessage(ANALYSIS_MESSAGES[index]);
    }, 500);

    return () => clearInterval(interval);
  }, [isAnalysing]);

  const handleOptionSelect = (idx: number) => {
    if (showResponse) return;
    playClickSfx?.();
    setSelectedOption(idx);
    setShowResponse(true);
  };

  const handleNext = () => {
    playClickSfx?.();
    if (currentQ < QUESTIONS.length - 1) {
      setShowResponse(false);
      setSelectedOption(null);
      setCurrentQ(c => c + 1);
    } else {
      setIsAnalysing(true);
    }
  };

  // ── Analysing screen ──
  if (isAnalysing) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.h2
            className="handwriting text-5xl text-primary mb-8"
            animate={{ scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Analysing...
          </motion.h2>

          <p className="text-foreground/70 mb-6">
            Please wait while we process the results...
          </p>

          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-white/40 to-primary rounded-full"
              style={{ backgroundSize: '200% 100%' }}
              initial={{ width: 0 }}
              animate={{
                width: '100%',
                backgroundPosition: ['0% 0%', '200% 0%'],
              }}
              transition={{
                width: { duration: 3 },
                backgroundPosition: { repeat: Infinity, duration: 1.2, ease: 'linear' },
              }}
            />
          </div>

          <motion.p
            className="mt-2 text-primary"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {displayMessage}
          </motion.p>

          {/* Steps list */}
          <div className="mt-8 space-y-1 text-left max-w-xs mx-auto">
            {ANALYSIS_MESSAGES.slice(0, analysisStep + 1).map((msg, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs font-mono ${
                  i === analysisStep ? 'text-primary' : 'text-foreground/30 line-through'
                }`}
              >
                {i < analysisStep ? '✓' : '▶'} {msg}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Finished screen ──
  if (isFinished) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="max-w-md"
        >
          <motion.h2
            className="handwriting text-5xl text-primary mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Personality Analysis Complete
          </motion.h2>

          <p className="text-xl text-foreground/80 mb-12 leading-relaxed">
            After analysing every answer...
            <br /><br />
            We have reached one conclusion.
            <br /><br />
            <span className="text-primary font-semibold">There is only one Shriya.</span>
            <br /><br />
            And honestly... that's pretty awesome. ❤️
          </p>

          <button
            onClick={() => { playClickSfx?.(); onComplete(); }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-sans font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            data-testid="button-quiz-finish"
          >
            Move On
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Quiz screen ──
  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-primary/60 text-sm font-bold tracking-[0.3em] uppercase mb-4 block">
            Personality Scan
          </span>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i < currentQ
                    ? 'w-8 bg-primary'
                    : i === currentQ
                    ? 'w-8 bg-primary/80'
                    : 'w-4 bg-muted'
                }`}
              />
            ))}
          </div>

          <h2 className="handwriting text-4xl text-primary mb-3">
            How Well Do You Know Yourself?
          </h2>

          <p className="text-foreground/60 mb-6">
            Choose whatever feels right...
          </p>

          <AnimatePresence mode="wait">
            <motion.h3
              key={currentQ}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-medium text-foreground"
            >
              {q.question}
            </motion.h3>
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 mb-8">
          {q.options.map((opt, idx) => (
            <motion.button
              key={`${currentQ}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={{ scale: showResponse ? 1 : 1.02 }}
              whileTap={{ scale: showResponse ? 1 : 0.98 }}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all border ${
                showResponse
                  ? selectedOption === idx
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-card border-card-border opacity-50'
                  : 'bg-card hover:bg-muted border-card-border text-foreground hover:border-primary/50'
              }`}
              disabled={showResponse}
              data-testid={`quiz-option-${idx}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                    showResponse && selectedOption === idx
                      ? 'border-primary text-primary'
                      : 'border-current/30'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                {opt}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Response */}
        <AnimatePresence>
          {showResponse && selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-primary font-bold mb-6 text-lg">
                {q.responses[selectedOption]}
              </p>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-sans font-medium hover:scale-105 transition-transform"
                data-testid="button-quiz-next"
              >
                {currentQ < QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
