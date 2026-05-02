import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import type { InvitationData, SectionConfig } from '../types';
import ContentTab from './invitation-editor/ContentTab';
import DesignTab from './invitation-editor/DesignTab';
import SectionsTab from './invitation-editor/SectionsTab';
import PreviewPane from './invitation-editor/PreviewPane';
import type { EditorTab } from './invitation-editor/types';

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

  // Tab button component
  const TabButton = ({ tab, label, icon }: { tab: EditorTab; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <span>{icon}</span>
      {label}
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
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <TabButton tab="content" label="Nội dung" icon="📝" />
          <TabButton tab="design" label="Thiết kế" icon="🎨" />
          <TabButton tab="sections" label="Sections" icon="🧩" />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' && (
            <ContentTab draft={draft} onChange={updateDraft} />
          )}
          {activeTab === 'design' && (
            <DesignTab draft={draft} onChange={updateDraft} />
          )}
          {activeTab === 'sections' && (
            <SectionsTab sections={draft.sections} onChange={updateSections} />
          )}
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </span>
            ) : hasChanges ? (
              'Lưu thay đổi'
            ) : (
              'Đã lưu'
            )}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              draft.isPublished
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            } disabled:opacity-50`}
          >
            {isPublishing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xuất bản...
              </span>
            ) : draft.isPublished ? (
              <span className="flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Đã xuất bản</span>
              </span>
            ) : (
              'Xuất bản thiệp cưới'
            )}
          </button>

          {draft.isPublished && original?.slug && (
            <a
              href={`/invitation/${original.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-center text-sm text-primary hover:underline"
            >
              Xem thiệp cưới đã xuất bản →
            </a>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:col-span-3">
        <PreviewPane draft={draft} originalSlug={original?.slug || null} />
      </div>
    </div>
  );
}
