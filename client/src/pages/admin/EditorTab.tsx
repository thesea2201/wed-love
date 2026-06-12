import { useParams, Navigate } from 'react-router-dom';
import InvitationEditor from '../../components/InvitationEditor';
import type { EditorTab } from '../../components/invitation-editor/types';

const VALID_TABS: readonly EditorTab[] = ['content', 'design', 'sections', 'photos'] as const;

function isEditorTab(s: string | undefined): s is EditorTab {
  return !!s && (VALID_TABS as readonly string[]).includes(s);
}

export default function EditorTab() {
  const { invId, editorTab } = useParams<{ invId: string; editorTab: string }>();

  if (!invId) {
    return <Navigate to="/dashboard" replace />;
  }
  // Invalid or missing editorTab param: fall back to the default. The URL
  // stays the same so the user can fix it without a redirect loop.
  const tab: EditorTab = isEditorTab(editorTab) ? editorTab : 'content';

  return <InvitationEditor invitationId={invId} activeTab={tab} />;
}
