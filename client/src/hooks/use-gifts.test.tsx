import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { useGifts, useSendGift } from './use-gifts';
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

describe('useGifts', () => {
  it('fetches with optional since parameter', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { gifts: [] } });
    const { result } = renderHook(() => useGifts('demo', '2026-06-12T00:00:00Z'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.get).toHaveBeenCalledWith('/public/invitations/demo/gifts', { params: { since: '2026-06-12T00:00:00Z' } });
  });

  it('fetches without since when undefined', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { gifts: [] } });
    const { result } = renderHook(() => useGifts('demo'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.get).toHaveBeenCalledWith('/public/invitations/demo/gifts', { params: undefined });
  });
});

describe('useSendGift', () => {
  it('POSTs to /public/wishes/:id/gifts', async () => {
    const gift = { id: 'g1', wishId: 'w1', giftType: 'heart', guestId: 'gx', invitationId: 'i1', createdAt: '2026-06-12T00:00:00Z', guest: { name: 'X' } };
    (api.post as any).mockResolvedValueOnce({ data: { gift } });
    const { result } = renderHook(() => useSendGift(), { wrapper: makeWrapper() });
    result.current.mutate({ wishId: 'w1', guestToken: 'tok', giftType: 'heart' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(api.post).toHaveBeenCalledWith('/public/wishes/w1/gifts', { guestToken: 'tok', giftType: 'heart' });
  });
});
