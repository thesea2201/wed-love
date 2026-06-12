import { useState } from 'react';
import type { Wish } from '../../../hooks/use-wishes';
import WishComposer from './WishComposer';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  slug: string;
  guestToken: string;
  guestName: string;
  primaryColor: string;
  myWishes: Wish[];
  onGiftSent?: (gift: { type: 'heart' | 'flower' | 'star' | 'cake' | 'ring'; guestName: string }) => void;
}

export default function PendingWishBanner({ slug, guestToken, guestName, primaryColor, myWishes, onGiftSent }: Props) {
  const pending = myWishes.filter((w) => w.moderationStatus === 'pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = editingId ? myWishes.find((w) => w.id === editingId) ?? null : null;

  if (pending.length === 0) return null;

  return (
    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="text-xs font-semibold text-amber-800 mb-1.5">
        Lời chúc của bạn đang chờ duyệt ({pending.length})
      </div>
      <div className="space-y-1.5">
        <AnimatePresence>
          {pending.map((w) => (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => setEditingId(w.id)}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="block w-full text-left text-sm text-amber-900 bg-white/60 hover:bg-white rounded px-2 py-1.5 line-clamp-2"
            >
              {w.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      {editing && (
        <div className="mt-2">
          <WishComposer
            slug={slug}
            guestToken={guestToken}
            guestName={guestName}
            primaryColor={primaryColor}
            editingWish={editing}
            onEditDone={() => setEditingId(null)}
            onGiftSent={onGiftSent}
          />
        </div>
      )}
    </div>
  );
}
