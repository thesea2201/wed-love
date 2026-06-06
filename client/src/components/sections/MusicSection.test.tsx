import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MusicSection from './MusicSection';
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

const baseConfig: SectionConfig['config'] = { showControls: true };

describe('MusicSection', () => {
  beforeEach(() => {
    cleanup();
    // jsdom does not implement HTMLMediaElement.play/pause — stub them so
    // the component can mount without throwing.
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('renders nothing when musicUrl is null', () => {
    const { container } = render(
      <MusicSection
        config={baseConfig}
        invitation={{ ...baseInvitation, musicUrl: null }}
        guest={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the floating play button when musicUrl is set and controls are visible', () => {
    render(
      <MusicSection
        config={baseConfig}
        invitation={{ ...baseInvitation, musicUrl: 'https://example.com/song.mp3' }}
        guest={null}
      />
    );
    const toggle = screen.getByTestId('music-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-label', 'Phát nhạc nền');
  });

  it('hides the floating controls when showControls is false', () => {
    render(
      <MusicSection
        config={{ showControls: false }}
        invitation={{ ...baseInvitation, musicUrl: 'https://example.com/song.mp3' }}
        guest={null}
      />
    );
    expect(screen.queryByTestId('music-toggle')).not.toBeInTheDocument();
  });

  it('invokes the audio play method on toggle click', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play');
    render(
      <MusicSection
        config={baseConfig}
        invitation={{ ...baseInvitation, musicUrl: 'https://example.com/song.mp3' }}
        guest={null}
      />
    );
    fireEvent.click(screen.getByTestId('music-toggle'));
    expect(playSpy).toHaveBeenCalled();
  });

  it('reflects muted state on the audio element', () => {
    render(
      <MusicSection
        config={baseConfig}
        invitation={{
          ...baseInvitation,
          musicUrl: 'https://example.com/song.mp3',
          musicAutoplay: true,
        }}
        guest={null}
      />
    );
    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    // initial muted state from useState(false)
    expect(audio?.muted).toBe(false);
  });
});
