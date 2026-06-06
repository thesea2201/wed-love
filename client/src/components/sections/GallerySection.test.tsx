import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import GallerySection from './GallerySection';
import type { InvitationData, SectionConfig } from '../../types';

const baseInvitation: InvitationData = {
  id: 'inv-1',
  slug: 'an-va-linh-abc12345',
  template: 'cinematic',
  title: 'An & Linh',
  subtitle: null,
  primaryColor: '#c8956c',
  secondaryColor: null,
  fontFamily: 'Playfair Display',
  groomName: 'An',
  brideName: 'Linh',
  weddingDate: '2026-12-31T10:00:00.000Z',
  venue: null,
  venueAddress: null,
  ceremonyTime: null,
  receptionTime: null,
  story: null,
  coverPhoto: null,
  gallery: [
    'https://example.com/a.jpg',
    'https://example.com/b.jpg',
    'https://example.com/c.jpg',
  ],
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

const baseConfig: SectionConfig['config'] = { columns: 3, lightbox: true };

describe('GallerySection', () => {
  beforeEach(() => cleanup());

  it('renders a thumb for each gallery image', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    expect(screen.getByTestId('gallery-thumb-0')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-thumb-1')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-thumb-2')).toBeInTheDocument();
  });

  it('opens lightbox with prev/next when thumb is clicked and lightbox is enabled', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    expect(screen.getByTestId('lightbox-prev')).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-next')).toBeInTheDocument();
  });

  it('does not open lightbox when lightbox config is false', () => {
    render(
      <GallerySection
        config={{ columns: 3, lightbox: false }}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    expect(screen.queryByTestId('lightbox-prev')).not.toBeInTheDocument();
  });

  it('navigates forward with the next button', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    fireEvent.click(screen.getByTestId('lightbox-next'));
    // image index 1 → counter should read 2 / 3
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('wraps from last to first on next', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-2'));
    // start at 3 / 3
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('lightbox-next'));
    // wrapped to 1 / 3
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('wraps from first to last on prev', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('lightbox-prev'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('closes lightbox on Esc key', async () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    expect(screen.getByTestId('lightbox-prev')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('lightbox-prev')).not.toBeInTheDocument();
    });
  });

  it('navigates with arrow keys', () => {
    render(
      <GallerySection
        config={baseConfig}
        invitation={baseInvitation}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('gallery-thumb-0'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
