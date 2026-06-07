import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from './auth-store';
import type { User } from './auth-store';

// Mock the api module
vi.mock('../utils/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

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

describe('auth-store.ts — Zustand Auth Store', () => {
  // Get references to the mocked api
  let api: any;
  let mockPost: any;
  let mockGet: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Re-import to get fresh store state
    vi.resetModules();
    const { useAuthStore: freshStore } = await import('./auth-store');
    // Reset store to initial state
    freshStore.getState().logout();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to get mocked api
  async function getMockedApi(): Promise<any> {
    const apiModule = await import('../utils/api');
    return apiModule.default;
  }

  // ─── INITIAL STATE ───
  describe('Initial state', () => {
    it('should initialize with token from localStorage if present', async () => {
      localStorageMock.setItem('token', 'stored-token');

      vi.resetModules();
      const { useAuthStore: freshStore } = await import('./auth-store');
      const state = freshStore.getState();

      expect(state.token).toBe('stored-token');
    });

    it('should initialize with null token if not in localStorage', () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
    });

    it('should initialize with null user', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should initialize with isLoading = false', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  // ─── LOGIN ───
  describe('login()', () => {
    it('should set isLoading=true during login, then false on success', async () => {
      const api = await getMockedApi();
      api.post.mockResolvedValue({
        data: {
          token: 'new-token',
          user: { id: '1', email: 'test@example.com', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' },
        },
      });

      const loginPromise = useAuthStore.getState().login('test@example.com', 'password');

      // During login, isLoading should be true
      expect(useAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.token).toBe('new-token');
    });

    it('should call api.post with correct endpoint and credentials', async () => {
      const api = await getMockedApi();
      api.post.mockResolvedValue({
        data: { token: 't', user: { id: '1', email: 'e', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' } },
      });

      await useAuthStore.getState().login('user@test.com', 'pass123');

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@test.com',
        password: 'pass123',
      });
    });

    it('should store token in localStorage and state on success', async () => {
      const api = await getMockedApi();
      api.post.mockResolvedValue({
        data: {
          token: 'login-token-123',
          user: { id: '1', email: 'test@example.com', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' },
        },
      });

      await useAuthStore.getState().login('test@example.com', 'password');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'login-token-123');
      expect(useAuthStore.getState().token).toBe('login-token-123');
    });

    it('should store user data in state on success', async () => {
      const api = await getMockedApi();
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        groomName: 'John',
        brideName: 'Jane',
        weddingDate: '2026-06-15',
        plan: 'premium',
      };
      api.post.mockResolvedValue({
        data: { token: 't', user: mockUser },
      });

      await useAuthStore.getState().login('test@example.com', 'password');

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should set isLoading=false and re-throw on API error', async () => {
      const api = await getMockedApi();
      api.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ─── REGISTER ───
  describe('register()', () => {
    it('should call api.post with all registration fields', async () => {
      const api = await getMockedApi();
      api.post.mockResolvedValue({
        data: { token: 'reg-token', user: { id: '1', email: 'e', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' } },
      });

      const registerData = {
        email: 'new@example.com',
        password: 'securePass',
        groomName: 'Groom',
        brideName: 'Bride',
        weddingDate: '2026-08-20',
      };

      await useAuthStore.getState().register(registerData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('should store token and user on successful registration', async () => {
      const api = await getMockedApi();
      const mockUser = { id: '2', email: 'new@example.com', groomName: 'G', brideName: 'B', weddingDate: '2026-08-20', plan: 'free' };
      api.post.mockResolvedValue({
        data: { token: 'new-reg-token', user: mockUser },
      });

      await useAuthStore.getState().register({
        email: 'new@example.com',
        password: 'pass',
        groomName: 'G',
        brideName: 'B',
        weddingDate: '2026-08-20',
      });

      expect(useAuthStore.getState().token).toBe('new-reg-token');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  // ─── FETCH ME ───
  describe('fetchMe()', () => {
    it('should call api.get with /auth/me', async () => {
      const api = await getMockedApi();
      api.get.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' } },
      });

      await useAuthStore.getState().fetchMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should update user state on success', async () => {
      const api = await getMockedApi();
      const mockUser = { id: '1', email: 'test@example.com', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' };
      api.get.mockResolvedValue({ data: { user: mockUser } });

      await useAuthStore.getState().fetchMe();

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should logout on API error (invalid token)', async () => {
      const api = await getMockedApi();
      api.get.mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().fetchMe();

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  // ─── LOGOUT ───
  describe('logout()', () => {
    it('should clear token and user from state', () => {
      // Set some state first
      useAuthStore.setState({ token: 'some-token', user: { id: '1', email: 'e', groomName: 'G', brideName: 'B', weddingDate: '2026-01-01', plan: 'free' } as User });

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should remove token from localStorage', () => {
      localStorageMock.setItem('token', 'token-to-remove');

      useAuthStore.getState().logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
