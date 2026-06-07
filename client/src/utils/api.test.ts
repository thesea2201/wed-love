import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

// Dynamically import api after mocks are set up
let api: typeof import('./api').default;

describe('api.ts — Axios instance with interceptors', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockLocation.href = '';
    // Re-import to get fresh module state
    vi.resetModules();
    const module = await import('./api');
    api = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── REQUEST INTERCEPTOR ───
  describe('Request interceptor', () => {
    it('should add Authorization header when token exists in localStorage', async () => {
      localStorageMock.setItem('token', 'test-token-123');

      // Re-import to pick up the token
      vi.resetModules();
      const { default: freshApi } = await import('./api');

      const config = { headers: {} as any };
      const result = await (freshApi as any).interceptors.request.handlers[0].fulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should NOT add Authorization header when no token in localStorage', async () => {
      localStorageMock.removeItem('token');

      vi.resetModules();
      const { default: freshApi } = await import('./api');

      const config = { headers: {} as any };
      const result = await (freshApi as any).interceptors.request.handlers[0].fulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  // ─── RESPONSE INTERCEPTOR ───
  describe('Response interceptor — 401 handling', () => {
    it('should remove token and redirect to / on 401 error', async () => {
      localStorageMock.setItem('token', 'expired-token');

      vi.resetModules();
      const { default: freshApi } = await import('./api');

      const errorResponse = {
        response: { status: 401 },
      };

      // The error interceptor should call localStorage.removeItem and redirect
      try {
        await (freshApi as any).interceptors.response.handlers[0].rejected(errorResponse);
      } catch {
        // Expected to reject
      }

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocation.href).toBe('/');
    });

    it('should NOT redirect on non-401 errors', async () => {
      const errorResponse = {
        response: { status: 500 },
      };

      try {
        await (api as any).interceptors.response.handlers[0].rejected(errorResponse);
      } catch {
        // Expected
      }

      expect(mockLocation.href).not.toBe('/');
    });
  });

  // ─── BASE CONFIGURATION ───
  describe('Base configuration', () => {
    it('should have correct baseURL', () => {
      expect(api.defaults.baseURL).toBe('/api/v1');
    });

    it('should have Content-Type header set to application/json', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});
