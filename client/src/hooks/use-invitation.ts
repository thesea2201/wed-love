import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import type { InvitationPublicResponse, InvitationData, InvitationListItem } from '../types';

export function useInvitation(slug: string, token?: string, enabled: boolean = true) {
  return useQuery<InvitationPublicResponse>({
    queryKey: ['invitation', slug, token],
    queryFn: async () => {
      const params = token ? { token } : {};
      const res = await api.get(`/invitations/${slug}`, { params });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!slug && enabled,
  });
}

export function useInvitationAdmin(id: string) {
  return useQuery<{ invitation: InvitationData }>({
    queryKey: ['invitation-admin', id],
    queryFn: async () => {
      const res = await api.get(`/invitations/id/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useInvitationList() {
  return useQuery<InvitationListItem[]>({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await api.get('/invitations');
      return res.data;
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await api.patch(`/invitations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-admin'] });
    },
  });
}

export function useUpdateSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sections }: { id: string; sections: any[] }) => {
      const res = await api.patch(`/invitations/${id}/sections`, { sections });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitation-admin', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function usePublishInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/invitations/${id}/publish`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-admin'] });
    },
  });
}

export function useDuplicateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/invitations/${id}/duplicate`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}
