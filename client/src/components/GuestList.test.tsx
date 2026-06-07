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
  url: 'https://wed.love/inv/an-va-linh-token-abc',
  pngUrl: '/api/v1/guests/guest-1/qr.png?format=png',
  svgUrl: '/api/v1/guests/guest-1/qr.svg?format=svg',
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
    expect(screen.getByAltText(`QR code for ${sampleQrInfo.guestName}`)).toHaveAttribute(
      'src',
      sampleQrInfo.pngUrl
    );
    expect(screen.getByText(sampleQrInfo.url)).toBeInTheDocument();
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

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Tạo mã QR mới/);

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
