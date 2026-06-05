import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import type { InvitationData, SectionConfig } from '../types';
import ContentTab from './invitation-editor/ContentTab';
import DesignTab from './invitation-editor/DesignTab';
import SectionsTab from './invitation-editor/SectionsTab';
import PhotosTab from './invitation-editor/PhotosTab';
import PreviewPane from './invitation-editor/PreviewPane';
import type { EditorTab } from './invitation-editor/types';
import { useIsMobile } from '../hooks/use-media-query';

interface Props {
  invitationId: string;
}

export default function InvitationEditor({ invitationId }: Props) {
  // Editor state
  const [original, setOriginal] = useState<InvitationData | null>(null);
  const [draft, setDraft] = useState<InvitationData | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();

  // Fetch invitation data
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await api.get(`/invitations/id/${invitationId}`);
        const inv = res.data.invitation as InvitationData;
        setOriginal(inv);
        setDraft(inv);
      } catch (err) {
        console.error('Failed to fetch invitation:', err);
        setSaveError('Không thể tải thông tin thiệp cưới');
      }
    };
    fetchInvitation();
  }, [invitationId]);

  // Update draft with partial changes
  const updateDraft = useCallback((updates: Partial<InvitationData>) => {
    setDraft((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setHasChanges(true);
      return updated;
    });
  }, []);

  // Update sections specifically
  const updateSections = useCallback((newSections: SectionConfig[]) => {
    setDraft((prev) => {
      if (!prev) return null;
      const updated = { ...prev, sections: newSections };
      setHasChanges(true);
      return updated;
    });
  }, []);

  // Save changes to backend
  const handleSave = async () => {
    if (!draft) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Save main invitation data
      const contentUpdate = {
        title: draft.title,
        subtitle: draft.subtitle,
        primaryColor: draft.primaryColor,
        secondaryColor: draft.secondaryColor,
        fontFamily: draft.fontFamily,
        template: draft.template,
        venue: draft.venue,
        venueAddress: draft.venueAddress,
        ceremonyTime: draft.ceremonyTime,
        receptionTime: draft.receptionTime,
        story: draft.story,
        coverPhoto: draft.coverPhoto,
        gallery: draft.gallery,
        brideName: draft.brideName,
        groomName: draft.groomName,
        weddingDate: draft.weddingDate,
      };

      await api.patch(`/invitations/${invitationId}`, contentUpdate);

      // Save sections separately
      await api.patch(`/invitations/${invitationId}/sections`, {
        sections: draft.sections,
      });

      setOriginal(draft);
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to save:', err);
      setSaveError(err.response?.data?.error || 'Lưu thay đổi thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish invitation
  const handlePublish = async () => {
    if (!draft?.isPublished && hasChanges) {
      // Auto-save before publish
      await handleSave();
    }

    setIsPublishing(true);
    try {
      await api.post(`/invitations/${invitationId}/publish`);
      setDraft((prev) => (prev ? { ...prev, isPublished: true } : null));
      setOriginal((prev) => (prev ? { ...prev, isPublished: true } : null));
    } catch (err: any) {
      console.error('Failed to publish:', err);
      setSaveError(err.response?.data?.error || 'Xuất bản thất bại');
    } finally {
      setIsPublishing(false);
    }
  };

  // Tab button component - compact on mobile
  const TabButton = ({ tab, label, icon }: { tab: EditorTab; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
        activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="text-[10px] sm:text-sm">{label}</span>
    </button>
  );

  if (!draft) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-120px)] min-h-[600px]">
      {/* Left Panel - Editor */}
      <div className={`flex flex-col bg-white rounded-xl shadow-sm overflow-hidden ${
        showPreview && isMobile ? 'hidden' : 'lg:col-span-2'
      }`}>
        {/* Mobile Preview Toggle - Compact */}
        {isMobile && (
          <div className="px-3 py-1.5 bg-gray-50 border-b flex items-center justify-between">
            <span className="text-xs text-gray-500">✏️ Đang chỉnh sửa</span>
            <button
              onClick={() => setShowPreview(true)}
              className="text-xs px-2 py-1 bg-dark text-white rounded-md flex items-center gap-1"
            >
              <span>👁️</span>
              <span>Xem</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          <TabButton tab="content" label="Nội dung" icon="📝" />
          <TabButton tab="design" label="Thiết kế" icon="🎨" />
          <TabButton tab="sections" label="Sections" icon="🧩" />
          <TabButton tab="photos" label="Ảnh" icon="🖼️" />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === 'content' && (
            <ContentTab draft={draft} onChange={updateDraft} />
          )}
          {activeTab === 'design' && (
            <DesignTab draft={draft} onChange={updateDraft} />
          )}
          {activeTab === 'sections' && (
            <SectionsTab sections={draft.sections} onChange={updateSections} gallery={draft.gallery} onGalleryChange={(gallery) => updateDraft({ gallery })} />
          )}
          {activeTab === 'photos' && (
            <PhotosTab gallery={draft.gallery} onChange={(gallery) => updateDraft({ gallery })} coverPhoto={draft.coverPhoto} sections={draft.sections} />
          )}
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Action Buttons - Compact on mobile */}
        <div className="p-2 sm:p-4 border-t bg-gray-50">
          <div className="flex gap-2 sm:gap-3 sm:flex-col">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex-1 sm:w-full py-2 sm:py-2.5 px-3 bg-white border border-gray-300 text-gray-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Đang...</span>
                </span>
              ) : hasChanges ? (
                <span className="flex items-center justify-center gap-1">
                  <span>💾</span>
                  <span>Lưu</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <span>✓</span>
                  <span>Đã lưu</span>
                </span>
              )}
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`flex-1 sm:w-full py-2 sm:py-2.5 px-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                draft.isPublished
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white'
              } disabled:opacity-50`}
            >
              {isPublishing ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : draft.isPublished ? (
                <span className="flex items-center justify-center gap-1">
                  <span>✓</span>
                  <span className="hidden sm:inline">Đã xuất bản</span>
                  <span className="sm:hidden">Live</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <span>🚀</span>
                  <span className="hidden sm:inline">Xuất bản</span>
                  <span className="sm:hidden">Publish</span>
                </span>
              )}
            </button>
          </div>

          {draft.isPublished && original?.slug && (
            <a
              href={`/invitation/${original.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-2 text-center text-xs text-primary hover:underline"
            >
              Xem thiệp →
            </a>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className={`lg:col-span-3 ${showPreview && isMobile ? 'fixed inset-0 z-50 bg-gray-50' : 'hidden lg:block'}`}>
        {isMobile && showPreview && (
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
            <span className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm">👁️ Xem trước</span>
            <button
              onClick={() => setShowPreview(false)}
              className="px-2 py-1 bg-white text-gray-700 rounded shadow-sm text-xs font-medium flex items-center gap-1"
            >
              <span>✏️</span>
              <span>Sửa</span>
            </button>
          </div>
        )}
        <div className={`h-full ${isMobile && showPreview ? 'pt-10 px-2 pb-2' : ''}`}>
          <PreviewPane draft={draft} originalSlug={original?.slug || null} />
        </div>
      </div>
    </div>
  );
}
