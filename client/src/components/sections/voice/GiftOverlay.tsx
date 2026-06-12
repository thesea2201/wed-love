import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GiftEvent } from '../../../hooks/use-gifts';

const GIFT_EMOJI: Record<string, string> = {
  heart: '❤️',
  flower: '🌸',
  star: '⭐',
  cake: '🎂',
  ring: '💍',
};

interface FloatingGift {
  id: string;
  emoji: string;
  label: string;
  left: number;       // percentage 0-100
  duration: number;   // seconds
}

interface Props {
  /** New gifts to render as floating animations. Pass an array that changes over time. */
  newGifts: GiftEvent[];
  onConsumed?: (id: string) => void;
}

export default function GiftOverlay({ newGifts, onConsumed }: Props) {
  const [floating, setFloating] = useState<FloatingGift[]>([]);

  useEffect(() => {
    if (newGifts.length === 0) return;
    const next = newGifts.map((g) => ({
      id: g.id,
      emoji: GIFT_EMOJI[g.giftType] ?? '🎁',
      label: `${g.guest?.name ?? 'Ai đó'} đã tặng`,
      left: 10 + Math.random() * 80,
      duration: 2.5 + Math.random() * 1.5,
    }));
    setFloating((prev) => [...prev, ...next].slice(-12));
    next.forEach((g) => onConsumed?.(g.id));
  }, [newGifts, onConsumed]);

  useEffect(() => {
    if (floating.length === 0) return;
    const timers = floating.map((f) =>
      window.setTimeout(() => {
        setFloating((prev) => prev.filter((p) => p.id !== f.id));
      }, f.duration * 1000),
    );
    return () => { timers.forEach(window.clearTimeout); };
  }, [floating]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <AnimatePresence>
        {floating.map((f) => (
          <motion.div
            key={f.id}
            initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1.2 }}
            exit={{ y: '-10vh', opacity: 0, scale: 0.6 }}
            transition={{ duration: f.duration, ease: 'easeOut' }}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${f.left}%` }}
          >
            <div className="text-3xl md:text-4xl drop-shadow-lg">{f.emoji}</div>
            <div className="text-xs text-white bg-black/50 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
              {f.label}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
