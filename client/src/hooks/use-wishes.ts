import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export interface Gift {
  id: string;
  giftType: 'heart' | 'flower' | 'star' | 'cake' | 'ring';
  guestId: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  guestId: string;
  invitationId: string;
  text: string;
  audioUrl: string | null;
  audioDuration: number | null;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;
  createdAt: string;
  gifts: Gift[];
  guest?: { name: string };
}

const STORAGE_PREFIX = 'wedlove:pending-wishes:';

function readLocalWishes(slug: string): Wish[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalWishes(slug: string, wishes: Wish[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(wishes));
  } catch {
    // ignore quota errors
  }
}

/**
 * Public wish feed (approved wishes for this invitation).
 * Polls every 5s for live updates.
 */
export function useWishes(slug: string) {
  return useQuery<Wish[]>({
    queryKey: ['wishes', 'public', slug],
    queryFn: async () => {
      const res = await api.get(`/public/invitations/${slug}/wishes`, { params: { status: 'approved' } });
      return res.data.wishes;
    },
    enabled: !!slug,
    refetchInterval: 5_000,
  });
}

/**
 * This guest's own wishes (any moderation status).
 * Used to show "your wish is pending review" state.
 */
export function useMyWishes(slug: string, guestToken: string | null | undefined) {
  return useQuery<Wish[]>({
    queryKey: ['wishes', 'mine', slug, guestToken],
    queryFn: async () => {
      const res = await api.get(`/public/invitations/${slug}/wishes`, { params: { status: 'mine', token: guestToken } });
      return res.data.wishes;
    },
    enabled: !!slug && !!guestToken,
  });
}

/**
 * Create a new wish. Stores locally as 'pending' first so the composer
 * shows it immediately; rolls back on failure.
 */
export function useCreateWish(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ guestToken, text, audioUrl, audioDuration }: { guestToken: string; text: string; audioUrl?: string; audioDuration?: number }) => {
      const res = await api.post(`/public/invitations/${slug}/wishes`, { guestToken, text, audioUrl, audioDuration });
      return res.data.wish as Wish;
    },
    onSuccess: (wish) => {
      // Append to local cache so the guest sees it immediately
      const local = readLocalWishes(slug);
      writeLocalWishes(slug, [{ ...wish, gifts: [] }, ...local]);
      queryClient.invalidateQueries({ queryKey: ['wishes', 'public', slug] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine', slug] });
    },
  });
}

/**
 * Edit your own pending wish (re-POST with the same intent).
 * Backend doesn't have PATCH for guests; we DELETE + recreate.
 */
export function useEditWish(slug: string) {
  const queryClient = useQueryClient();
  const create = useCreateWish(slug);
  return useMutation({
    mutationFn: async ({ id, guestToken, text }: { id: string; guestToken: string; text: string }) => {
      await api.delete(`/public/wishes/${id}`, { params: { token: guestToken } });
      return create.mutateAsync({ guestToken, text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes', 'public', slug] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine', slug] });
    },
  });
}

/**
 * Delete your own pending wish.
 */
export function useDeleteWish(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, guestToken }: { id: string; guestToken: string }) => {
      await api.delete(`/public/wishes/${id}`, { params: { token: guestToken } });
      const local = readLocalWishes(slug).filter((w) => w.id !== id);
      writeLocalWishes(slug, local);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes', 'public', slug] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine', slug] });
    },
  });
}

/**
 * Read locally-cached wishes for this slug. Synchronous accessor for the
 * composer preview (not a query — read once on mount).
 */
export function readLocalCachedWishes(slug: string): Wish[] {
  return readLocalWishes(slug);
}
