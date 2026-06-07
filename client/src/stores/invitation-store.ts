import { create } from 'zustand';

interface InvitationStore {
  selectedInvitationId: string | null;
  setSelectedInvitationId: (id: string | null) => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  selectedInvitationId: null,
  setSelectedInvitationId: (id) => set({ selectedInvitationId: id }),
}));
