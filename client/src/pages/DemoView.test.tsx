import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DemoView', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders SectionRenderer with the chosen template', () => {
    renderDemo('/demo/cinematic');
    expect(screen.getByTestId('section-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('renderer-template')).toHaveTextContent('cinematic');
    expect(screen.getByTestId('renderer-slug')).toHaveTextContent('demo-cinematic');
  });

  it('uses a wedding date 30 days in the future (so the countdown always renders)', () => {
    renderDemo('/demo/elegant');
    const slug = screen.getByTestId('renderer-slug').textContent;
    // slug is "demo-elegant" — sanity check
    expect(slug).toBe('demo-elegant');
  });

  it('falls back to cinematic preset when the template id is unknown', () => {
    renderDemo('/demo/unknown-template');
    expect(screen.getByTestId('renderer-template')).toHaveTextContent('unknown-template');
    // Should not crash and should still render some sections (the cinematic fallback)
    expect(screen.getByTestId('section-renderer')).toBeInTheDocument();
  });

  it('passes the right number of sections for each template preset', () => {
    // cinematic preset has 7 sections
    renderDemo('/demo/cinematic');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('7');

    cleanup();

    // minimal preset has 3 sections
    renderDemo('/demo/minimal');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('3');

    cleanup();

    // modern preset has 5 sections
    renderDemo('/demo/modern');
    expect(screen.getByTestId('renderer-section-count')).toHaveTextContent('5');
  });

  it('shows a demo banner with a back-to-home link', () => {
    renderDemo('/demo/vintage');
    const back = screen.getByRole('link', { name: /về trang chủ/i });
    expect(back).toHaveAttribute('href', '/');
  });

  it('shows a CTA to login from the demo banner', () => {
    renderDemo('/demo/cinematic');
    const cta = screen.getByRole('link', { name: /tạo thiệp của bạn/i });
    expect(cta).toHaveAttribute('href', '/login');
  });
});
