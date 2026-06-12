import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../utils/api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { baseURL: '/api/v1', headers: {} },
  };
  return { default: mockApi };
});

import { useWishes, useMyWishes, useCreateWish, useDeleteWish } from './use-wishes';
import api from '../utils/api';

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('useWishes', () => {
  it('fetches approved wishes for a slug', async () => {
    const wishes = [{ id: '1', text: 'hi', createdAt: '2026-06-12T00:00:00Z', moderationStatus: 'approved', isPublic: true, audioUrl: null, audioDuration: null, guestId: 'g1', invitationId: 'i1', guest: { name: 'X' }, gifts: [] }];
    (api.get as any).mockResolvedValueOnce({ data: { wishes } });
    const { result } = renderHook(() => useWishes('demo'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(result.current.data).toEqual(wishes);
    expect(api.get).toHaveBeenCalledWith('/public/invitations/demo/wishes', { params: { status: 'approved' } });
  });
});

describe('useMyWishes', () => {
  it('is idle when token is null', () => {
    const { result } = renderHook(() => useMyWishes('demo', null), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('fetches with token when provided', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { wishes: [] } });
    const { result } = renderHook(() => useMyWishes('demo', 'tok123'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.get).toHaveBeenCalledWith('/public/invitations/demo/wishes', { params: { status: 'mine', token: 'tok123' } });
  });
});

describe('useCreateWish', () => {
  it('POSTs and invalidates queries on success', async () => {
    const created = { id: 'new', text: 'hi', moderationStatus: 'pending', isPublic: true, audioUrl: null, audioDuration: null, guestId: 'g1', invitationId: 'i1', createdAt: '2026-06-12T00:00:00Z', guest: { name: 'X' }, gifts: [] };
    (api.post as any).mockResolvedValueOnce({ data: { wish: created } });
    const { result } = renderHook(() => useCreateWish('demo'), { wrapper: makeWrapper() });
    result.current.mutate({ guestToken: 'tok', text: 'hi' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.post).toHaveBeenCalledWith('/public/invitations/demo/wishes', { guestToken: 'tok', text: 'hi', audioUrl: undefined, audioDuration: undefined });
  });
});

describe('useDeleteWish', () => {
  it('DELETEs via API', async () => {
    (api.delete as any).mockResolvedValueOnce({});
    const { result } = renderHook(() => useDeleteWish('demo'), { wrapper: makeWrapper() });
    result.current.mutate({ id: 'w1', guestToken: 'tok' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.delete).toHaveBeenCalledWith('/public/wishes/w1', { params: { token: 'tok' } });
  });
});
