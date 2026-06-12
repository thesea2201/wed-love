import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('./invitation-editor/ContentTab', () => ({
  default: (props: any) => (
    <div data-testid="content-tab">
      <input
        data-testid="content-input"
        value={props.draft.groomName}
        onChange={(e: any) => props.onChange({ groomName: e.target.value })}
      />
    </div>
  ),
}));
vi.mock('./invitation-editor/DesignTab', () => ({ default: () => <div data-testid="design-tab" /> }));
vi.mock('./invitation-editor/SectionsTab', () => ({ default: () => <div data-testid="sections-tab" /> }));
vi.mock('./invitation-editor/PhotosTab', () => ({ default: () => <div data-testid="photos-tab" /> }));
vi.mock('./invitation-editor/PreviewPane', () => ({ default: () => <div data-testid="preview-pane" /> }));

import api from '../utils/api';
import InvitationEditor from './InvitationEditor';

const mockGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockPatch = api.patch as unknown as ReturnType<typeof vi.fn>;

const sampleInvitation = {
  id: 'inv-1',
  slug: 'an-va-linh',
  template: 'cinematic',
  title: 'An & Linh',
  subtitle: null,
  primaryColor: '#c8956c',
  secondaryColor: null,
  fontFamily: 'Playfair Display',
  groomName: 'An',
  brideName: 'Linh',
  weddingDate: '2026-08-15T10:00:00Z',
  venue: null,
  venueAddress: null,
  ceremonyTime: null,
  receptionTime: null,
  story: null,
  coverPhoto: null,
  gallery: [],
  sections: [],
  musicUrl: null,
  musicAutoplay: false,
  musicFadeIn: false,
  mapUrl: null,
  latitude: null,
  longitude: null,
  status: 'draft',
  isPublished: false,
  publishedAt: null,
};

async function setup() {
  mockGet.mockResolvedValue({ data: { invitation: sampleInvitation } });
  mockPatch.mockResolvedValue({ data: { ok: true } });
  render(
    <MemoryRouter initialEntries={['/dashboard/inv-1/editor/content']}>
      <InvitationEditor invitationId="inv-1" />
    </MemoryRouter>
  );
  await screen.findByTestId('content-tab');
}

function fireSaveShortcut(modifier: 'meta' | 'ctrl' = 'meta', extraKeys: Record<string, boolean> = {}) {
  const event = new KeyboardEvent('keydown', {
    key: 's',
    [modifier + 'Key']: true,
    ...extraKeys,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
}

describe('InvitationEditor — autosave indicator + Cmd+S', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPatch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Đã lưu Vừa xong" after a successful save', async () => {
    await setup();
    fireEvent.click(screen.getByTestId('content-input'));
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    fireSaveShortcut();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
    const status = await screen.findByTestId('save-status');
    expect(status).toHaveTextContent(/Đã lưu/);
    expect(status.textContent).toMatch(/Vừa xong|phút trước|giờ trước|ngày trước/);
  });

  it('Cmd+S triggers a PATCH when there are unsaved changes', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    expect(mockPatch).not.toHaveBeenCalled();
    fireSaveShortcut();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledTimes(2);
    });
    expect(mockPatch).toHaveBeenCalledWith(
      '/invitations/inv-1',
      expect.objectContaining({ groomName: 'Bình' })
    );
    expect(mockPatch).toHaveBeenCalledWith('/invitations/inv-1/sections', expect.any(Object));
  });

  it('Ctrl+S also triggers save (Windows / Linux users)', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    fireSaveShortcut('ctrl');
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
  });

  it('Cmd+S does nothing when there are no unsaved changes', async () => {
    await setup();
    fireSaveShortcut();
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('Cmd+Shift+S does NOT trigger save (modifier guard)', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    fireSaveShortcut('meta', { shiftKey: true });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('Alt+S does NOT trigger save (modifier guard)', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    fireSaveShortcut('meta', { altKey: true });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('Cmd+S calls preventDefault to suppress browser save dialog', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    const event = fireSaveShortcut();
    expect(event.defaultPrevented).toBe(true);
  });

  it('relative time updates from "Vừa xong" to "X phút trước" as time advances', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const start = new Date('2026-06-07T10:00:00Z').getTime();
    vi.setSystemTime(start);

    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    fireSaveShortcut();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
    const status = await screen.findByTestId('save-status');
    expect(status).toHaveTextContent('Vừa xong');

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(screen.getByTestId('save-status')).toHaveTextContent('5 phút trước');
  });

  it('save button shows ⌘S hint when there are unsaved changes', async () => {
    await setup();
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Bình' } });
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });
});
