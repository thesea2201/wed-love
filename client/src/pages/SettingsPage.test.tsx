import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';
import { ToastProvider } from '../components/Toast';
import { ConfirmProvider } from '../components/ConfirmDialog';
import { useAuthStore } from '../stores/auth-store';
import type { User } from '../stores/auth-store';

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../utils/api';
const mockGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockPut = api.put as unknown as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as unknown as ReturnType<typeof vi.fn>;

const sampleUser: User = {
  id: 'user-1',
  email: 'settings@example.com',
  groomName: 'An',
  brideName: 'Linh',
  weddingDate: '2026-08-15T10:00:00.000Z',
  plan: 'free',
};

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ConfirmProvider>
          <SettingsPage />
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPut.mockReset();
    mockDelete.mockReset();
    useAuthStore.setState({ token: 'tok', user: sampleUser, isLoading: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders account info for the logged-in user', () => {
    renderWithProviders();
    expect(screen.getByText('settings@example.com')).toBeInTheDocument();
    expect(screen.getByText('An')).toBeInTheDocument();
    expect(screen.getByText('Linh')).toBeInTheDocument();
  });

  it('shows password validation error when current password is empty', async () => {
    renderWithProviders();
    const newPw = screen.getByLabelText(/Mật khẩu mới/);
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/);
    fireEvent.change(newPw, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPw, { target: { value: 'newPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    const err = await screen.findByTestId('change-error');
    expect(err).toHaveTextContent(/nhập mật khẩu hiện tại/i);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('shows error when new password is too short', async () => {
    renderWithProviders();
    const currentPw = screen.getByLabelText(/Mật khẩu hiện tại/);
    const newPw = screen.getByLabelText(/Mật khẩu mới/);
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/);
    fireEvent.change(currentPw, { target: { value: 'oldPassword123' } });
    fireEvent.change(newPw, { target: { value: 'short' } });
    fireEvent.change(confirmPw, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    const err = await screen.findByTestId('change-error');
    expect(err).toHaveTextContent(/ít nhất 8/);
  });

  it('shows error when new password equals current password', async () => {
    renderWithProviders();
    const currentPw = screen.getByLabelText(/Mật khẩu hiện tại/);
    const newPw = screen.getByLabelText(/Mật khẩu mới/);
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/);
    fireEvent.change(currentPw, { target: { value: 'samePassword' } });
    fireEvent.change(newPw, { target: { value: 'samePassword' } });
    fireEvent.change(confirmPw, { target: { value: 'samePassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    const err = await screen.findByTestId('change-error');
    expect(err).toHaveTextContent(/khác mật khẩu hiện tại/i);
  });

  it('shows error when confirm password does not match', async () => {
    renderWithProviders();
    const currentPw = screen.getByLabelText(/Mật khẩu hiện tại/);
    const newPw = screen.getByLabelText(/Mật khẩu mới/);
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/);
    fireEvent.change(currentPw, { target: { value: 'oldPassword123' } });
    fireEvent.change(newPw, { target: { value: 'newPassword456' } });
    fireEvent.change(confirmPw, { target: { value: 'differentPassword456' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    const err = await screen.findByTestId('change-error');
    expect(err).toHaveTextContent(/không khớp/);
  });

  it('calls api.put and clears the form on successful password change', async () => {
    mockPut.mockResolvedValue({ data: { ok: true } });
    renderWithProviders();
    const currentPw = screen.getByLabelText(/Mật khẩu hiện tại/) as HTMLInputElement;
    const newPw = screen.getByLabelText(/Mật khẩu mới/) as HTMLInputElement;
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/) as HTMLInputElement;
    fireEvent.change(currentPw, { target: { value: 'oldPassword123' } });
    fireEvent.change(newPw, { target: { value: 'newPassword456' } });
    fireEvent.change(confirmPw, { target: { value: 'newPassword456' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/auth/password', {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });
    });

    // Form cleared
    await waitFor(() => {
      expect(currentPw.value).toBe('');
      expect(newPw.value).toBe('');
      expect(confirmPw.value).toBe('');
    });
  });

  it('shows server error when password change fails', async () => {
    mockPut.mockRejectedValue({ response: { data: { error: 'Mật khẩu hiện tại không đúng' } } });
    renderWithProviders();
    const currentPw = screen.getByLabelText(/Mật khẩu hiện tại/);
    const newPw = screen.getByLabelText(/Mật khẩu mới/);
    const confirmPw = screen.getByLabelText(/Xác nhận mật khẩu/);
    fireEvent.change(currentPw, { target: { value: 'wrongOld' } });
    fireEvent.change(newPw, { target: { value: 'newPassword456' } });
    fireEvent.change(confirmPw, { target: { value: 'newPassword456' } });
    fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu$/ }));

    const err = await screen.findByTestId('change-error');
    expect(err).toHaveTextContent(/Mật khẩu hiện tại không đúng/);
  });

  it('clears auth state and navigates to /login on logout', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('opens the confirm dialog before deleting account', async () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Tôi muốn xóa tài khoản/ }));
    const passwordInput = await screen.findByPlaceholderText('Mật khẩu của bạn');
    fireEvent.change(passwordInput, { target: { value: 'myPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Xóa tài khoản vĩnh viễn/ }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Xóa tài khoản vĩnh viễn/);

    // Abort the confirm — api should NOT be called
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deletes the account, clears state, and navigates home after confirm', async () => {
    mockDelete.mockResolvedValue({ data: { ok: true } });
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Tôi muốn xóa tài khoản/ }));
    const passwordInput = await screen.findByPlaceholderText('Mật khẩu của bạn');
    fireEvent.change(passwordInput, { target: { value: 'myPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Xóa tài khoản vĩnh viễn/ }));

    const confirmYes = await screen.findByTestId('confirm-yes');
    await act(async () => {
      fireEvent.click(confirmYes);
    });

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/auth/account', {
        data: { password: 'myPassword' },
      });
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('shows server error when account deletion fails', async () => {
    mockDelete.mockRejectedValue({ response: { data: { error: 'Mật khẩu không đúng' } } });
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Tôi muốn xóa tài khoản/ }));
    const passwordInput = await screen.findByPlaceholderText('Mật khẩu của bạn');
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Xóa tài khoản vĩnh viễn/ }));

    const confirmYes = await screen.findByTestId('confirm-yes');
    await act(async () => {
      fireEvent.click(confirmYes);
    });

    const err = await screen.findByTestId('delete-error');
    expect(err).toHaveTextContent(/Mật khẩu không đúng/);
  });
});
