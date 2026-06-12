import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SECTION_TYPE_LABELS } from '../../utils/sections';
import type { SectionProps, InvitationData, GuestData } from '../../types';
import { useWishes, useMyWishes, type Wish } from '../../hooks/use-wishes';
import { useGifts, type GiftEvent } from '../../hooks/use-gifts';
import WishFeed from './voice/WishFeed';
import WishComposer from './voice/WishComposer';
import GiftOverlay from './voice/GiftOverlay';
import PendingWishBanner from './voice/PendingWishBanner';

interface OverlayConfig {
  height: 'full' | 'half' | 'min';
  trigger: 'always' | 'visible';
}

function readOverlayConfig(config: any): OverlayConfig {
  const c = config?.overlay;
  return {
    height: c?.height === 'half' || c?.height === 'min' ? c.height : 'full',
    trigger: c?.trigger === 'visible' ? 'visible' : 'always',
  };
}

interface VoiceSectionProps {
  config: Record<string, any>;
  invitation: InvitationData;
  guest: GuestData | null;
  guestToken?: string | null;
}

export default function VoiceSection({ config, invitation, guest, guestToken }: VoiceSectionProps) {
  const primaryColor = invitation.primaryColor || '#c8956c';
  const label = SECTION_TYPE_LABELS.voice.nameVi;
  const slug = invitation.slug;
  const overlay = readOverlayConfig(config);
  const giftLastSeenRef = useRef<string | undefined>(undefined);
  const [pendingGifts, setPendingGifts] = useState<GiftEvent[]>([]);

  const { data: wishes = [] } = useWishes(slug);
  const { data: myWishes = [] } = useMyWishes(slug, guestToken ?? null);
  const { data: recentGifts = [] } = useGifts(slug, giftLastSeenRef.current);

  // Detect new gifts since last seen, push to overlay
  const latestGiftTs = recentGifts[0]?.createdAt;
  if (latestGiftTs && latestGiftTs !== giftLastSeenRef.current) {
    const previous = giftLastSeenRef.current;
    giftLastSeenRef.current = latestGiftTs;
    if (previous) {
      const newOnes = recentGifts.filter((g) => g.createdAt > previous);
      if (newOnes.length > 0) {
        setPendingGifts((p) => [...p, ...newOnes]);
      }
    }
  }

  const consumeGifts = useCallback((_id: string) => {
    // The overlay removes each gift after its animation completes; we just
    // prune our buffer to keep it small.
    setPendingGifts((p) => p.slice(-8));
  }, []);

  const onGiftSent = useCallback((_g: { type: GiftEvent['giftType']; guestName: string }) => {
    // Refresh gifts so the sender also sees their gift in the feed.
    setPendingGifts((p) => [...p]);
  }, []);

  const containerHeightClass = overlay.height === 'half' ? 'py-12 md:py-16' : overlay.height === 'min' ? 'py-8 md:py-12' : 'py-12 md:py-24';

  return (
    <section
      className={`px-3 md:px-4 bg-white ${containerHeightClass}`}
      id="voice"
    >
      <div className="w-full mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-4xl text-center mb-2 md:mb-3"
          style={{ color: primaryColor }}
        >
          {label}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-xs md:text-sm mb-6 md:mb-8"
        >
          {guest?.name ? `Gửi lời chúc, ${guest.name}!` : 'Gửi lời chúc cho cô dâu chú rể'}
        </motion.p>

        {guest && guestToken && (
          <PendingWishBanner
            slug={slug}
            guestToken={guestToken}
            guestName={guest.name}
            primaryColor={primaryColor}
            myWishes={myWishes}
            onGiftSent={onGiftSent}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Lời chúc mới nhất</h3>
            <WishFeed wishes={wishes} primaryColor={primaryColor} />
          </div>

          {guest && guestToken ? (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Gửi lời chúc</h3>
              <WishComposer
                slug={slug}
                guestToken={guestToken}
                guestName={guest.name}
                primaryColor={primaryColor}
                editingWish={null}
                onEditDone={() => {}}
                onGiftSent={onGiftSent}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Mở liên kết cá nhân hóa của bạn để gửi lời chúc.
            </div>
          )}
        </div>
      </div>

      <GiftOverlay newGifts={pendingGifts} onConsumed={consumeGifts} />
    </section>
  );
}
