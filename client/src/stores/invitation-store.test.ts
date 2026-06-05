import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInvitationStore } from './invitation-store';

describe('invitation-store.ts — Zustand Invitation Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useInvitationStore.setState({ selectedInvitationId: null });
  });

  // ─── INITIAL STATE ───
  describe('Initial state', () => {
    it('should have selectedInvitationId = null initially', () => {
      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBeNull();
    });

    it('should have setSelectedInvitationId as a function', () => {
      const state = useInvitationStore.getState();
      expect(typeof state.setSelectedInvitationId).toBe('function');
    });
  });

  // ─── SET SELECTED INVITATION ID ───
  describe('setSelectedInvitationId()', () => {
    it('should update selectedInvitationId to a valid id', () => {
      useInvitationStore.getState().setSelectedInvitationId('invitation-123');
      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBe('invitation-123');
    });

    it('should update selectedInvitationId to a different id', () => {
      useInvitationStore.getState().setSelectedInvitationId('first-id');
      useInvitationStore.getState().setSelectedInvitationId('second-id');

      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBe('second-id');
    });

    it('should allow setting selectedInvitationId to null', () => {
      useInvitationStore.getState().setSelectedInvitationId('some-id');
      useInvitationStore.getState().setSelectedInvitationId(null);

      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBeNull();
    });

    it('should handle empty string as id', () => {
      useInvitationStore.getState().setSelectedInvitationId('');
      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBe('');
    });

    it('should handle UUID-style invitation id', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      useInvitationStore.getState().setSelectedInvitationId(uuid);
      const state = useInvitationStore.getState();
      expect(state.selectedInvitationId).toBe(uuid);
    });
  });

  // ─── STATE PERSISTENCE (Zustand behavior) ───
  describe('State updates', () => {
    it('should reflect updated state immediately after set', () => {
      const store = useInvitationStore;

      store.getState().setSelectedInvitationId('test-id');

      // State should be updated synchronously
      expect(store.getState().selectedInvitationId).toBe('test-id');
    });

    it('should allow multiple state transitions', () => {
      const store = useInvitationStore;

      store.getState().setSelectedInvitationId('id-1');
      expect(store.getState().selectedInvitationId).toBe('id-1');

      store.getState().setSelectedInvitationId('id-2');
      expect(store.getState().selectedInvitationId).toBe('id-2');

      store.getState().setSelectedInvitationId(null);
      expect(store.getState().selectedInvitationId).toBeNull();
    });
  });
});
