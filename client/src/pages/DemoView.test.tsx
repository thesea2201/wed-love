import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DemoView from './DemoView';

// Mock SectionRenderer so we don't have to load every section component
// (HeroSection uses framer-motion, GallerySection uses dnd-kit, etc.).
// We're testing that DemoView wires the right data through, not the
// section internals.
vi.mock('../components/sections/SectionRenderer', () => ({
  default: ({ sections, invitation }: { sections: unknown[]; invitation: { template: string; slug: string } }) => (
    <div data-testid="section-renderer">
      <span data-testid="renderer-template">{invitation.template}</span>
      <span data-testid="renderer-slug">{invitation.slug}</span>
      <span data-testid="renderer-section-count">{Array.isArray(sections) ? sections.length : 0}</span>
    </div>
  ),
}));

function renderDemo(initialPath: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/demo/:templateId" element={<DemoView />} />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DemoView', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders SectionRenderer with the chosen template', () => {
    renderDemo('/demo/cinematic');
    expect(screen.getByTestId('section-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('renderer-template')).toHaveTextContent('cinematic');
    expect(screen.getByTestId('renderer-slug')).toHaveTextContent('demo-cinematic');
  });

  it('falls back to cinematic preset when the template id is unknown', () => {
    renderDemo('/demo/unknown-template');
    expect(screen.getByTestId('renderer-template')).toHaveTextContent('unknown-template');
    expect(screen.getByTestId('section-renderer')).toBeInTheDocument();
  });

  it('passes the right number of sections for each template preset', () => {
    renderDemo('/demo/cinematic');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('7');

    cleanup();
    renderDemo('/demo/minimal');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('3');

    cleanup();
    renderDemo('/demo/modern');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('5');
  });

  it('shows a sticky top bar with template name', () => {
    renderDemo('/demo/elegant');
    const topBar = screen.getByRole('region', { name: /thanh điều hướng demo/i });
    expect(topBar).toBeInTheDocument();
    expect(topBar).toHaveTextContent('Thanh lịch');
    expect(topBar).toHaveTextContent('Elegant');
  });

  it('shows a back-to-home link in the top bar', () => {
    renderDemo('/demo/vintage');
    const back = screen.getByRole('link', { name: /về trang chủ|trang chủ/i });
    expect(back).toHaveAttribute('href', '/');
  });

  it('shows a "Dùng template này" CTA pointing to /login?template=X', () => {
    renderDemo('/demo/cinematic');
    const cta = screen.getByTestId('use-template-cta');
    expect(cta).toHaveTextContent(/Dùng template này/);
    expect(cta).toHaveAttribute('href', '/login?template=cinematic');
  });

  it('shows prev/next template buttons between templates', () => {
    renderDemo('/demo/cinematic');
    // cinematic is index 0 → has next, no prev
    expect(screen.queryByTestId('prev-template')).not.toBeInTheDocument();
    expect(screen.getByTestId('next-template')).toBeInTheDocument();

    cleanup();
    renderDemo('/demo/elegant');
    // elegant is index 1 → has both
    expect(screen.getByTestId('prev-template')).toBeInTheDocument();
    expect(screen.getByTestId('next-template')).toBeInTheDocument();

    cleanup();
    renderDemo('/demo/vintage');
    // vintage is the last index → has prev, no next
    expect(screen.getByTestId('prev-template')).toBeInTheDocument();
    expect(screen.queryByTestId('next-template')).not.toBeInTheDocument();
  });

  it('shows the first-visit hint overlay when localStorage flag is unset', () => {
    renderDemo('/demo/cinematic');
    expect(screen.getByTestId('demo-hint')).toBeInTheDocument();
    expect(screen.getByText(/Mẹo nhỏ/)).toBeInTheDocument();
  });

  it('hides the hint overlay when already dismissed', () => {
    localStorage.setItem('wedlove-demo-hint-dismissed', '1');
    renderDemo('/demo/cinematic');
    expect(screen.queryByTestId('demo-hint')).not.toBeInTheDocument();
  });

  it('dismisses the hint and persists to localStorage when X is clicked', () => {
    renderDemo('/demo/cinematic');
    const dismissBtn = screen.getByTestId('dismiss-hint');
    fireEvent.click(dismissBtn);
    expect(screen.queryByTestId('demo-hint')).not.toBeInTheDocument();
    expect(localStorage.getItem('wedlove-demo-hint-dismissed')).toBe('1');
  });
});
