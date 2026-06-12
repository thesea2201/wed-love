import { motion, AnimatePresence } from 'framer-motion';
import type { Wish } from '../../../hooks/use-wishes';

interface Props {
  wishes: Wish[];
  primaryColor: string;
}

const GIFT_EMOJI: Record<string, string> = {
  heart: '❤️',
  flower: '🌸',
  star: '⭐',
  cake: '🎂',
  ring: '💍',
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return 'vừa xong';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function WishFeed({ wishes, primaryColor }: Props) {
  if (wishes.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        Hãy là người đầu tiên gửi lời chúc!
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {wishes.map((w) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-50 rounded-lg p-3 border-l-4"
            style={{ borderLeftColor: primaryColor }}
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-800">
                {w.guest?.name ?? 'Khách mời'}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(w.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{w.text}</p>
            {w.audioUrl && (
              <audio controls className="mt-2 w-full h-8" src={w.audioUrl} preload="none" />
            )}
            {w.gifts.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1 text-base">
                {w.gifts.map((g) => (
                  <span key={g.id} title={GIFT_EMOJI[g.giftType] ?? '🎁'}>
                    {GIFT_EMOJI[g.giftType] ?? '🎁'}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
