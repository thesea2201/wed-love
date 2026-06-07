import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders the header with brand and login link', () => {
    renderPage();
    // Brand appears in both header and footer — sanity check at least 2
    const brandHits = screen.getAllByText('WedLove');
    expect(brandHits.length).toBeGreaterThanOrEqual(2);
    const loginLinks = screen.getAllByRole('link', { name: /đăng nhập/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('renders the hero with primary CTA', () => {
    renderPage();
    // The h1 in the hero is unique. "Thiệp cưới online" also appears in the
    // footer subtitle, so we use the role-scoped query to find the h1.
    const heroHeading = screen.getByRole('heading', { level: 1 });
    expect(heroHeading.textContent).toMatch(/thiệp cưới online/i);
    const startLink = screen.getByRole('link', { name: /bắt đầu miễn phí/i });
    expect(startLink).toHaveAttribute('href', '/login');
  });

  it('renders all 6 feature cards', () => {
    renderPage();
    expect(screen.getByText('Mẫu thiệp đa dạng')).toBeInTheDocument();
    expect(screen.getByText('Album ảnh cưới')).toBeInTheDocument();
    expect(screen.getByText('Đếm ngược ngày cưới')).toBeInTheDocument();
    expect(screen.getByText('Bản đồ sự kiện')).toBeInTheDocument();
    expect(screen.getByText('Nhạc nền')).toBeInTheDocument();
    expect(screen.getByText('Quản lý khách mời')).toBeInTheDocument();
  });

  it('renders the template gallery with all 5 templates', () => {
    renderPage();
    const grid = screen.getByTestId('template-grid');
    expect(grid).toBeInTheDocument();
    // 5 cards
    const cards = [
      'template-card-cinematic',
      'template-card-elegant',
      'template-card-modern',
      'template-card-minimal',
      'template-card-vintage',
    ];
    for (const tid of cards) {
      expect(screen.getByTestId(tid)).toBeInTheDocument();
    }
  });

  it('links each template card to its /demo/:id route', () => {
    renderPage();
    for (const id of ['cinematic', 'elegant', 'modern', 'minimal', 'vintage']) {
      const link = screen.getByTestId(`template-card-${id}`);
      expect(link).toHaveAttribute('href', `/demo/${id}`);
    }
  });

  it('renders the trust strip with 4 stat tiles', () => {
    renderPage();
    // 5 mẫu thiệp đẹp, 12+ section, QR, Miễn phí
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12+')).toBeInTheDocument();
    expect(screen.getByText('QR')).toBeInTheDocument();
    expect(screen.getByText('Miễn phí')).toBeInTheDocument();
  });

  it('renders the CTA section with create link', () => {
    renderPage();
    expect(screen.getByText(/Sẵn sàng cho đám cưới của bạn\?/i)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /tạo thiệp cưới ngay/i });
    expect(cta).toHaveAttribute('href', '/login');
  });

  it('does not crash when rendered in test env (IntersectionObserver etc.)', () => {
    // Smoke test — if LandingPage throws on mount, this fails
    const { container } = renderPage();
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
