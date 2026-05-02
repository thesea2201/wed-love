import { motion } from 'framer-motion';

interface Props {
  guest?: { name: string } | null;
  groomName: string;
  brideName: string;
  weddingDate: string;
}

export default function HeroSection({ guest, groomName, brideName, weddingDate }: Props) {
  const date = new Date(weddingDate);
  const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-white px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="text-center"
      >
        {guest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg mb-4 tracking-wider"
          >
            Dear {guest.name},
          </motion.p>
        )}
        
        <p className="text-sm tracking-[0.3em] uppercase mb-4">Together with our families</p>
        
        <h1 className="font-display text-6xl md:text-8xl mb-2">
          {groomName}
        </h1>
        <p className="font-display text-3xl italic mb-2">&</p>
        <h1 className="font-display text-6xl md:text-8xl mb-8">
          {brideName}
        </h1>
        
        <div className="flex items-center justify-center gap-4 text-sm tracking-wider">
          <span>{date.toLocaleDateString('en-US', { month: 'long' })}</span>
          <span className="w-12 h-px bg-white/60" />
          <span>{date.getDate()}</span>
          <span className="w-12 h-px bg-white/60" />
          <span>{date.getFullYear()}</span>
        </div>

        {daysUntil > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12"
          >
            <p className="text-sm tracking-wider mb-2">Save the date</p>
            <div className="flex gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{daysUntil}</span>
                <span className="block text-xs">days</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
