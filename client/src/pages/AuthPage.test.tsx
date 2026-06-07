import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';

vi.mock('../utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../utils/api';
const mockPost = api.post as unknown as ReturnType<typeof vi.fn>;

function renderAuth(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockPost.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts in login mode by default', () => {
    renderAuth('/login');
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
    // Groom/Bride/Wedding date fields are hidden in login mode
    expect(screen.queryByLabelText('Tên chú rể')).not.toBeInTheDocument();
  });

  it('starts in register mode when ?template= is present (demo CTA)', () => {
    renderAuth('/login?template=cinematic');
    expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tên chú rể')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên cô dâu')).toBeInTheDocument();
  });

  it('starts in register mode when ?mode=register is present', () => {
    renderAuth('/login?mode=register');
    expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
  });

  it('toggles between login and register modes', () => {
    renderAuth('/login');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('redirects to /dashboard if token is already present', () => {
    localStorage.setItem('token', 'existing-token');
    renderAuth('/login');
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });
});
