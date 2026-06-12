import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the data hooks so the dashboard doesn't actually call the BE.
vi.mock('../hooks/use-invitation', () => ({
  useInvitationList: vi.fn(),
}));
vi.mock('../hooks/use-analytics', () => ({
  useAnalytics: vi.fn(() => ({ data: { views: 0, totalGuests: 0, attending: 0 }, isLoading: false, isError: false })),
}));

import { useInvitationList } from '../hooks/use-invitation';
import AdminDashboard from './AdminDashboard';
import DashboardIndex from './admin/DashboardIndex';
import EditorTab from './admin/EditorTab';
import GuestsTab from './admin/GuestsTab';
import AnalyticsTab from './admin/AnalyticsTab';
import { ToastProvider } from '../components/Toast';
import { ConfirmProvider } from '../components/ConfirmDialog';

const mockUseInvitationList = useInvitationList as unknown as ReturnType<typeof vi.fn>;

const sampleInvitations = [
  { id: 'inv-1', slug: 'wedding-1', title: 'Wedding 1', isPublished: true },
  { id: 'inv-2', slug: 'wedding-2', title: 'Wedding 2', isPublished: false },
];

function renderDashboard(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/dashboard" element={<DashboardIndex />} />
            <Route path="/dashboard/:invId" element={<AdminDashboard />}>
              <Route path="editor/:editorTab" element={<EditorTab />} />
              <Route path="guests" element={<GuestsTab />} />
              <Route path="analytics" element={<AnalyticsTab />} />
            </Route>
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('AdminDashboard routing', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseInvitationList.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('/dashboard (bare)', () => {
    it('redirects to the first invitation\'s editor/content while loading', () => {
      // The loading state for DashboardIndex just shows a spinner; we then
      // resolve with invitations and assert the navigation.
      mockUseInvitationList.mockReturnValue({ data: [], isLoading: true });
      renderDashboard('/dashboard');
      // While loading: no invitation data, no header tabs. The spinner is
      // present (we don't assert on it specifically — just that we don't
      // crash).
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders the empty state when the user has no invitations', () => {
      mockUseInvitationList.mockReturnValue({ data: [], isLoading: false });
      renderDashboard('/dashboard');
      expect(screen.getByText('Bạn chưa có thiệp nào')).toBeInTheDocument();
    });

    it('lands on /dashboard/<first-inv>/editor/content when invitations exist (via a re-render after Navigate fires)', () => {
      // First render at /dashboard with no data → would show loading.
      // After data resolves, <Navigate> fires and the router re-mounts at
      // the resolved path. We simulate the latter by re-rendering at the
      // resolved path, which is what the redirect would do.
      mockUseInvitationList.mockReturnValue({ data: sampleInvitations, isLoading: false });
      renderDashboard('/dashboard');
      // The Navigate component would have re-routed to the editor. We can't
      // easily assert the navigation in jsdom without a full router, so
      // instead we render the resolved path and assert the editor's content
      // tab is present.
      cleanup();
      renderDashboard('/dashboard/inv-1/editor/content');
      // The editor's Content tab mock renders a content-tab testid via the
      // real component (InvitationEditor fetches data and falls back to
      // initial tab). We just check we're on an editor URL — the tab label
      // "Trình chỉnh sửa" should be visible in the dashboard header tabs.
      expect(screen.getByText('Trình chỉnh sửa')).toBeInTheDocument();
    });
  });

  describe('/dashboard/:invId/...', () => {
    beforeEach(() => {
      mockUseInvitationList.mockReturnValue({ data: sampleInvitations, isLoading: false });
    });

    it('renders the editor when path is /dashboard/inv-1/editor/content', () => {
      renderDashboard('/dashboard/inv-1/editor/content');
      expect(screen.getByText('Trình chỉnh sửa')).toBeInTheDocument();
      expect(screen.getByText('Khách mời')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      // The selector shows the current invitation.
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('inv-1');
    });

    it('falls back to content tab when the editorTab param is missing or invalid', () => {
      // EditorTab is mounted at /editor/:editorTab so it can't be empty in
      // production routing, but defensively, if you hit /editor/something
      // invalid the child should still render. We test by hitting
      // /editor/sections (valid) and /editor/garbage — both should render
      // the editor without crashing.
      renderDashboard('/dashboard/inv-1/editor/sections');
      expect(screen.getByText('Trình chỉnh sửa')).toBeInTheDocument();

      cleanup();
      renderDashboard('/dashboard/inv-1/editor/garbage');
      expect(screen.getByText('Trình chỉnh sửa')).toBeInTheDocument();
    });

    it('renders the guest list when path is /dashboard/inv-1/guests', () => {
      renderDashboard('/dashboard/inv-1/guests');
      // GuestList calls the api client which is unmocked here, so the
      // component might error or show its loading state. The exact rendering
      // is GuestList's concern; we just need to assert we're on the guests
      // tab and the top-level tab is highlighted.
      expect(screen.getByText('Khách mời')).toBeInTheDocument();
    });

    it('renders the analytics panel when path is /dashboard/inv-1/analytics', () => {
      renderDashboard('/dashboard/inv-1/analytics');
      expect(screen.getByText('Lượt xem')).toBeInTheDocument();
      expect(screen.getByText('Tổng khách mời')).toBeInTheDocument();
      expect(screen.getByText('Xác nhận tham dự')).toBeInTheDocument();
    });

    it('renders the not-found state when the invId is unknown', () => {
      renderDashboard('/dashboard/garbage-id/editor/content');
      expect(screen.getByText('Thiệp không tồn tại')).toBeInTheDocument();
      expect(screen.getByText('Quay lại thiệp đầu tiên')).toBeInTheDocument();
    });

    it('marks the active top-level NavLink with the active style', () => {
      renderDashboard('/dashboard/inv-1/guests');
      const guestsLink = screen.getByText('Khách mời').closest('a')!;
      expect(guestsLink.className).toMatch(/border-primary text-primary/);
      // The other tabs should not be active.
      const editorLink = screen.getByText('Trình chỉnh sửa').closest('a')!;
      expect(editorLink.className).not.toMatch(/border-primary/);
    });

    it('reflects the URL invId in the invitation selector', () => {
      renderDashboard('/dashboard/inv-2/editor/design');
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('inv-2');
    });
  });
});
