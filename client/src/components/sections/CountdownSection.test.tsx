import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CountdownSection from './CountdownSection';
import type { InvitationData, SectionConfig } from '../../types';

const buildInvitation = (weddingDate: string): InvitationData => ({
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
  weddingDate,
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
});

const baseConfig: SectionConfig['config'] = { showSeconds: true, showLabels: true, style: 'boxed' };

describe('CountdownSection — Phase 2.6 wiring', () => {
  beforeEach(() => cleanup());

  it('reads weddingDate from the invitation prop (not from config)', () => {
    // Wedding in the future — 30 days from now
    const future = new Date();
    future.setDate(future.getDate() + 30);
    render(
      <CountdownSection
        config={baseConfig}
        invitation={buildInvitation(future.toISOString())}
        guest={null}
      />
    );
    // Should render the days label (30, 29, or 28 depending on timing) — labels confirm Vietnamese strings render
    expect(screen.getAllByText(/Ngày/).length).toBeGreaterThan(0);
  });

  it('renders the wedding-day message when the date has passed', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    render(
      <CountdownSection
        config={baseConfig}
        invitation={buildInvitation(past.toISOString())}
        guest={null}
      />
    );
    expect(screen.getByText(/Hôm nay là ngày vui/)).toBeInTheDocument();
  });

  it('hides seconds when showSeconds is false', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    render(
      <CountdownSection
        config={{ ...baseConfig, showSeconds: false }}
        invitation={buildInvitation(future.toISOString())}
        guest={null}
      />
    );
    // 'Ngày', 'Giờ', 'Phút' shown; 'Giây' hidden
    expect(screen.queryByText('Giây')).not.toBeInTheDocument();
    expect(screen.getByText('Ngày')).toBeInTheDocument();
  });
});
