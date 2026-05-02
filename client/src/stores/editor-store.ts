import { create } from 'zustand';

interface EditorStore {
  activeSectionId: string | null;
  previewMode: 'desktop' | 'mobile';
  isDirty: boolean;
  setActiveSection: (id: string | null) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setDirty: (dirty: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeSectionId: null,
  previewMode: 'desktop',
  isDirty: false,

  setActiveSection: (id) => set({ activeSectionId: id }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setDirty: (dirty) => set({ isDirty: dirty }),
}));
