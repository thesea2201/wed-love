import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import GuestList from './GuestList';
import { ToastProvider } from './Toast';
import { ConfirmProvider } from './ConfirmDialog';

vi.mock('../utils/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

import api from '../utils/api';
const mockGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockPost = api.post as unknown as ReturnType<typeof vi.fn>;

function renderWithProviders(ui: ReactNode) {
  return render(
    <ToastProvider>
      <ConfirmProvider>{ui}</ConfirmProvider>
    </ToastProvider>
  );
}

const sampleGuest = {
  id: 'guest-1',
  name: 'An',
  email: 'an@example.com',
  phone: null,
  rsvpStatus: 'pending',
  rsvpAttendees: 0,
  customMessage: null,
};

const sampleQrInfo = {
  guestId: 'guest-1',
  guestName: 'An',
  slug: 'an-va-linh-demo',
  token: 'd867ac9113588253ccdf2e2268ff4f07',
  url: 'https://wed.love/invitation/an-va-linh-demo?token=d867ac9113588253ccdf2e2268ff4f07',
  // BE returns absolute URLs (so dev FE :5173 → BE :3000 works without
  // the Vite proxy having to forward them).
  pngUrl: 'http://localhost:3000/api/v1/guests/guest-1/qr?format=png',
  svgUrl: 'http://localhost:3000/api/v1/guests/guest-1/qr?format=svg',
  viewedAt: '2026-05-01T10:00:00Z',
  viewCount: 3,
};

describe('GuestList QR modal', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it('fetches and renders QR info when the QR button is clicked', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/guests') return Promise.resolve({ data: { guests: [sampleGuest] } });
      if (url === '/guests/guest-1/qr-info') return Promise.resolve({ data: sampleQrInfo });
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    renderWithProviders(<GuestList invitationId="inv-1" />);

    const qrButton = await screen.findByTitle('View QR code');
    fireEvent.click(qrButton);

    expect(await screen.findByText(/Link:/)).toBeInTheDocument();
    // The client builds the displayed link from window.location.origin (FE origin),
    // not the BE-derived `qrInfo.url`. Defends against Host header spoofing.
    const expectedPublicUrl = `${window.location.origin}/invitation/${sampleQrInfo.slug}?token=${sampleQrInfo.token}`;
    const qrImg = screen.getByAltText(`QR code for ${sampleQrInfo.guestName}`);
    // The <img> src should be the BE PNG endpoint (absolute URL), with the
    // FE-origin URL passed as a query param so the encoded QR opens the
    // correct origin when scanned.
    expect(qrImg.getAttribute('src')).toMatch(
      new RegExp(`^${sampleQrInfo.pngUrl.replace(/[?]/g, '\\?')}&url=`)
    );
    expect(qrImg.getAttribute('src')).toContain(
      `url=${encodeURIComponent(expectedPublicUrl)}`
    );
    expect(screen.getByText(expectedPublicUrl)).toBeInTheDocument();
    expect(screen.queryByText(sampleQrInfo.url)).not.toBeInTheDocument();
    expect(screen.getByText(/Opened 3×/)).toBeInTheDocument();

    expect(mockGet).toHaveBeenCalledWith('/guests/guest-1/qr-info');
  });

  it('opens the confirm dialog when rotate is clicked and aborts on cancel', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/guests') return Promise.resolve({ data: { guests: [sampleGuest] } });
      if (url === '/guests/guest-1/qr-info') return Promise.resolve({ data: sampleQrInfo });
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    renderWithProviders(<GuestList invitationId="inv-1" />);

    fireEvent.click(await screen.findByTitle('View QR code'));
    await screen.findByText(/Link:/);

    const rotateButton = screen.getByTitle('Invalidate current link and issue a new one');
    fireEvent.click(rotateButton);

    // Find the confirm dialog specifically (not the QR modal behind it)
    // The confirm dialog has a button with testid 'confirm-yes'
    const confirmYes = await screen.findByTestId('confirm-yes');
    const dialog = confirmYes.closest('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Tạo mã QR mới/);

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => {
      // Both dialogs should be closed
      expect(screen.queryByRole('dialog', { name: /Tạo mã QR mới/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: /QR Code/ })).not.toBeInTheDocument();
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('calls regenerate-token and refetches QR info when the confirm is accepted', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/guests') return Promise.resolve({ data: { guests: [sampleGuest] } });
      if (url === '/guests/guest-1/qr-info') return Promise.resolve({ data: sampleQrInfo });
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });
    mockPost.mockResolvedValue({ data: { ok: true } });

    renderWithProviders(<GuestList invitationId="inv-1" />);

    fireEvent.click(await screen.findByTitle('View QR code'));
    await screen.findByText(/Link:/);

    const rotateButton = screen.getByTitle('Invalidate current link and issue a new one');
    fireEvent.click(rotateButton);

    const confirmYes = await screen.findByTestId('confirm-yes');
    await act(async () => {
      fireEvent.click(confirmYes);
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/guests/guest-1/regenerate-token');
    });

    const qrInfoCalls = mockGet.mock.calls.filter(([url]) => url === '/guests/guest-1/qr-info');
    expect(qrInfoCalls.length).toBeGreaterThanOrEqual(2);

    const toast = await screen.findByTestId('toast');
    expect(toast).toHaveTextContent(/Đã tạo mã QR mới/);
  });

  it('renders an error banner when qr-info request fails', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/guests') return Promise.resolve({ data: { guests: [sampleGuest] } });
      if (url === '/guests/guest-1/qr-info')
        return Promise.reject({ response: { data: { error: 'Token expired' } } });
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    renderWithProviders(<GuestList invitationId="inv-1" />);

    fireEvent.click(await screen.findByTitle('View QR code'));
    expect(await screen.findByText('Token expired')).toBeInTheDocument();
  });
});
