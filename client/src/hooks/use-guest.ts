import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  rsvpAttendees: number;
  tableNumber: string | null;
  relationship: string | null;
  token: string;
}

export function useGuestList(invitationId: string, filters?: { status?: string }) {
  return useQuery<Guest[]>({
    queryKey: ['guests', invitationId, filters],
    queryFn: async () => {
      const res = await api.get('/guests', { params: { invitationId, ...filters } });
      return res.data;
    },
    enabled: !!invitationId,
  });
}

export function useAddGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { invitationId: string; name: string; email?: string; phone?: string; relationship?: string }) => {
      const res = await api.post('/guests', data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guests', variables.invitationId] });
    },
  });
}

export function useGuestRSVP() {
  return useMutation({
    mutationFn: async ({ token, data }: { token: string; data: { status: string; attendees: number; dietary: string[] } }) => {
      const res = await api.post(`/guests/${token}/rsvp`, data);
      return res.data;
    },
  });
}

export function useBulkImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invitationId, guests }: { invitationId: string; guests: { name: string; email?: string; phone?: string }[] }) => {
      const res = await api.post('/guests/bulk', { invitationId, guests });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guests', variables.invitationId] });
    },
  });
}

export function useExportGuests() {
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.get('/guests/export', { params: { invitationId }, responseType: 'blob' });
      return res.data;
    },
  });
}
