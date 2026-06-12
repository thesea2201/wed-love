import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/api';

export interface GiftEvent {
  id: string;
  wishId: string;
  guestId: string;
  invitationId: string;
  giftType: 'heart' | 'flower' | 'star' | 'cake' | 'ring';
  createdAt: string;
  guest?: { name: string };
}

/**
 * Poll for new gifts since a given timestamp. Used by the floating
 * animation layer to fly icons up when guests send them.
 */
export function useGifts(slug: string, since?: string) {
  return useQuery<GiftEvent[]>({
    queryKey: ['gifts', slug, since],
    queryFn: async () => {
      const res = await api.get(`/public/invitations/${slug}/gifts`, { params: since ? { since } : undefined });
      return res.data.gifts;
    },
    enabled: !!slug,
    refetchInterval: 3_000,
  });
}

/**
 * Send a virtual gift. Mock — no payment.
 */
export function useSendGift() {
  return useMutation({
    mutationFn: async ({ wishId, guestToken, giftType }: { wishId: string; guestToken: string; giftType: GiftEvent['giftType'] }) => {
      const res = await api.post(`/public/wishes/${wishId}/gifts`, { guestToken, giftType });
      return res.data.gift as GiftEvent;
    },
  });
}
