import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCreateWish, useEditWish, useDeleteWish, type Wish } from '../../../hooks/use-wishes';
import { useSendGift, type GiftEvent } from '../../../hooks/use-gifts';

const GIFT_OPTIONS: Array<{ type: GiftEvent['giftType']; emoji: string; label: string }> = [
  { type: 'heart', emoji: '❤️', label: 'Trái tim' },
  { type: 'flower', emoji: '🌸', label: 'Hoa' },
  { type: 'star', emoji: '⭐', label: 'Ngôi sao' },
  { type: 'cake', emoji: '🎂', label: 'Bánh' },
  { type: 'ring', emoji: '💍', label: 'Nhẫn' },
];

interface Props {
  slug: string;
  guestToken: string;
  primaryColor: string;
  editingWish: Wish | null;
  onEditDone: () => void;
  onGiftSent?: (gift: { type: GiftEvent['giftType']; guestName: string }) => void;
  guestName: string;
}

export default function WishComposer({
  slug,
  guestToken,
  primaryColor,
  editingWish,
  onEditDone,
  onGiftSent,
  guestName,
}: Props) {
  const [text, setText] = useState(editingWish?.text ?? '');
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const create = useCreateWish(slug);
  const edit = useEditWish(slug);
  const remove = useDeleteWish(slug);
  const sendGift = useSendGift();
  const taRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!editingWish;
  const busy = create.isPending || edit.isPending;
  const maxLength = 2000;

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isEditing && editingWish) {
      edit.mutate(
        { id: editingWish.id, guestToken, text: trimmed },
        { onSuccess: () => { setText(''); onEditDone(); } },
      );
    } else {
      create.mutate(
        { guestToken, text: trimmed },
        { onSuccess: () => setText('') },
      );
    }
  }

  function sendAGift(type: GiftEvent['giftType']) {
    if (!editingWish) return;
    setShowGiftPicker(false);
    sendGift.mutate(
      { wishId: editingWish.id, guestToken, giftType: type },
      { onSuccess: () => onGiftSent?.({ type, guestName }) },
    );
  }

  function cancel() {
    setText('');
    onEditDone();
  }

  function removeIt() {
    if (!editingWish) return;
    if (!confirm('Xóa lời chúc này?')) return;
    remove.mutate({ id: editingWish.id, guestToken }, { onSuccess: cancel });
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder="Gửi lời chúc của bạn..."
        rows={3}
        maxLength={maxLength}
        className="w-full text-sm resize-none border-none focus:outline-none placeholder-gray-400"
        disabled={busy}
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-400">{text.length}/{maxLength}</span>
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <button
                type="button"
                onClick={removeIt}
                className="text-xs text-red-500 hover:underline"
                disabled={busy}
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={cancel}
                className="text-xs text-gray-500 hover:underline"
                disabled={busy}
              >
                Hủy
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGiftPicker((v) => !v)}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                >
                  🎁 Tặng quà
                </button>
                {showGiftPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-1 z-10"
                  >
                    {GIFT_OPTIONS.map((g) => (
                      <button
                        key={g.type}
                        onClick={() => sendAGift(g.type)}
                        className="text-xl p-1.5 rounded hover:bg-gray-100"
                        title={g.label}
                      >
                        {g.emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={busy || !text.trim()}
            className="text-sm px-3 py-1.5 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {busy ? 'Đang gửi...' : isEditing ? 'Cập nhật' : 'Gửi lời chúc'}
          </button>
        </div>
      </div>
    </div>
  );
}
