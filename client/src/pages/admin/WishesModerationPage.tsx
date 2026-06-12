import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/auth-store';

type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'all';

interface Wish {
  id: string;
  text: string;
  audioUrl: string | null;
  moderationStatus: string;
  isPublic: boolean;
  createdAt: string;
  guest: { name: string; email: string | null };
  gifts: { id: string; giftType: string; createdAt: string }[];
}

interface ApiResponse {
  wishes: Wish[];
}

async function fetchWishes(invitationId: string, status: ModerationStatus, token: string): Promise<Wish[]> {
  const qs = new URLSearchParams({ status });
  const res = await fetch(`/api/v1/admin/invitations/${invitationId}/wishes?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch wishes failed: ${res.status}`);
  const data: ApiResponse = await res.json();
  return data.wishes;
}

async function patchWish(id: string, status: string, token: string): Promise<Wish> {
  const res = await fetch(`/api/v1/admin/wishes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ moderationStatus: status }),
  });
  if (!res.ok) throw new Error(`Patch wish failed: ${res.status}`);
  const data: { wish: Wish } = await res.json();
  return data.wish;
}

const GIFT_EMOJI: Record<string, string> = {
  heart: '❤️', flower: '🌸', star: '⭐', cake: '🎂', ring: '💍',
};

export default function WishesModerationPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ModerationStatus>('pending');
  const qc = useQueryClient();

  // Fetch user's invitations to populate picker
  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations', user?.id],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/v1/invitations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
  });

  // Default to first invitation once loaded
  if (!invitationId && invitations.length > 0) {
    setInvitationId(invitations[0].id);
  }

  const { data: wishes = [], isLoading } = useQuery({
    queryKey: ['wishes', invitationId, status],
    queryFn: () => fetchWishes(invitationId!, status, token!),
    enabled: !!invitationId && !!token,
  });

  const patch = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'approved' | 'rejected' }) =>
      patchWish(id, next, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishes', invitationId] }),
  });

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Vui lòng đăng nhập.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="font-display text-2xl md:text-3xl mb-4">Duyệt lời chúc</h1>

      {invitations.length > 1 && (
        <select
          value={invitationId ?? ''}
          onChange={(e) => setInvitationId(e.target.value)}
          className="mb-4 border rounded px-3 py-2 text-sm"
        >
          {invitations.map((inv: any) => (
            <option key={inv.id} value={inv.id}>{inv.title} ({inv.slug})</option>
          ))}
        </select>
      )}

      <div className="flex gap-2 mb-4 border-b">
        {(['pending', 'approved', 'rejected', 'all'] as ModerationStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              status === s ? 'border-current font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'pending' && 'Chờ duyệt'}
            {s === 'approved' && 'Đã duyệt'}
            {s === 'rejected' && 'Từ chối'}
            {s === 'all' && 'Tất cả'}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-gray-500 text-sm">Đang tải...</div>}

      <div className="space-y-3">
        <AnimatePresence>
          {wishes.map((w) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div>
                  <span className="font-semibold text-sm">{w.guest.name}</span>
                  {w.guest.email && (
                    <span className="text-xs text-gray-500 ml-2">{w.guest.email}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(w.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{w.text}</p>
              {w.audioUrl && (
                <audio controls className="w-full h-9 mb-2" src={w.audioUrl} />
              )}
              {w.gifts.length > 0 && (
                <div className="flex gap-1 mb-2 text-lg">
                  {w.gifts.map((g) => (
                    <span key={g.id} title={g.giftType}>{GIFT_EMOJI[g.giftType] ?? '🎁'}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  w.moderationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                  w.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {w.moderationStatus}
                </span>
                {w.moderationStatus !== 'approved' && (
                  <button
                    onClick={() => patch.mutate({ id: w.id, next: 'approved' })}
                    disabled={patch.isPending}
                    className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                )}
                {w.moderationStatus !== 'rejected' && (
                  <button
                    onClick={() => patch.mutate({ id: w.id, next: 'rejected' })}
                    disabled={patch.isPending}
                    className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && wishes.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">Không có lời chúc nào.</div>
        )}
      </div>
    </div>
  );
}
