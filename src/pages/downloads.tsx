import { motion } from 'framer-motion';

const DOWNLOADS = [
  {
    label: '1 · Full React Project',
    description: 'The complete Vite + React + TypeScript source — run with pnpm/npm locally.',
    file: 'shriya-birthday-full-project.zip',
    icon: '📦',
    hint: 'Best for: editing content, adding features, and self-hosting',
  },
  {
    label: '2 · GitHub Pages Ready',
    description: 'Same source but pre-configured for GitHub Pages + a CI/CD workflow included.',
    file: 'shriya-birthday-github.zip',
    icon: '🐙',
    hint: 'Best for: deploying free via GitHub Pages',
  },
  {
    label: '3 · Standalone HTML/CSS/JS',
    description: 'One single index.html file — no build step, no node_modules. Open in any browser.',
    file: 'shriya-birthday-vanilla-html.zip',
    icon: '🌐',
    hint: 'Best for: sharing as a file, offline use, simple hosting',
  },
];

export default function Downloads() {
  const base = import.meta.env.BASE_URL;

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(100,80,180,0.18) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 70% 60%, rgba(212,175,55,0.10) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <p className="serif text-primary/50 text-sm tracking-widest mb-3">— Downloads —</p>
          <h1 className="serif text-4xl text-foreground/90 mb-2">Shriya's Birthday</h1>
          <p className="text-muted-foreground text-sm">Three formats, one experience.</p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {DOWNLOADS.map((d, i) => (
            <motion.a
              key={d.file}
              href={`${base}downloads/${d.file}`}
              download={d.file}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="group flex items-start gap-5 p-5 rounded-xl border border-primary/10 bg-card/60 backdrop-blur hover:border-primary/30 hover:bg-card/90 transition-all duration-300 no-underline"
            >
              <span className="text-3xl mt-0.5 select-none">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="serif text-lg text-primary/90 mb-1 group-hover:text-primary transition-colors">
                  {d.label}
                </p>
                <p className="text-sm text-foreground/70 mb-2 leading-relaxed">{d.description}</p>
                <p className="text-xs text-muted-foreground/60 italic">{d.hint}</p>
              </div>
              <motion.span
                className="text-primary/30 group-hover:text-primary text-xl self-center shrink-0 transition-colors"
                whileHover={{ x: 3 }}
              >
                ↓
              </motion.span>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <a href={base} className="text-sm text-muted-foreground/50 hover:text-primary transition-colors">
            ← Back to the experience
          </a>
        </motion.div>
      </div>
    </div>
  );
}
