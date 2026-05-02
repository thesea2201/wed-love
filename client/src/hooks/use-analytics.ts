import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import type { AnalyticsData } from '../types';

export function useAnalytics(invitationId: string) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', invitationId],
    queryFn: async () => {
      const res = await api.get(`/invitations/${invitationId}/analytics`);
      return res.data;
    },
    enabled: !!invitationId,
  });
}
