import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="serif text-primary/40 text-sm tracking-widest mb-4">— 404 —</p>
        <h1 className="serif text-4xl text-foreground/80 mb-2">Page not found</h1>
        <p className="text-foreground/40 text-sm">This page doesn't exist.</p>
      </motion.div>
    </div>
  );
}
