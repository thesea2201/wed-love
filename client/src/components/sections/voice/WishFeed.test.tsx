import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import WishFeed from './WishFeed';
import type { Wish } from '../../../hooks/use-wishes';

const makeWish = (overrides: Partial<Wish> = {}): Wish => ({
  id: '1',
  text: 'Chúc mừng',
  audioUrl: null,
  audioDuration: null,
  moderationStatus: 'approved',
  isPublic: true,
  createdAt: new Date(Date.now() - 30_000).toISOString(),
  guestId: 'g1',
  invitationId: 'i1',
  guest: { name: 'Minh' },
  gifts: [],
  ...overrides,
});

describe('WishFeed', () => {
  beforeEach(() => cleanup());

  it('renders empty state when no wishes', () => {
    render(<WishFeed wishes={[]} primaryColor="#c8956c" />);
    expect(screen.getByText(/Hãy là người đầu tiên/i)).toBeTruthy();
  });

  it('renders a wish with guest name and text', () => {
    render(<WishFeed wishes={[makeWish()]} primaryColor="#c8956c" />);
    expect(screen.getByText('Minh')).toBeTruthy();
    expect(screen.getByText('Chúc mừng')).toBeTruthy();
  });

  it('renders gift emoji when wish has gifts', () => {
    render(
      <WishFeed
        wishes={[makeWish({
          gifts: [
            { id: 'g1', giftType: 'heart', guestId: 'gx', createdAt: '2026-06-12T00:00:00Z' },
            { id: 'g2', giftType: 'flower', guestId: 'gx', createdAt: '2026-06-12T00:00:00Z' },
          ],
        })]}
        primaryColor="#c8956c"
      />,
    );
    expect(screen.getByText('❤️')).toBeTruthy();
    expect(screen.getByText('🌸')).toBeTruthy();
  });

  it('falls back to "Khách mời" when guest is missing', () => {
    const wish = makeWish();
    (wish as any).guest = undefined;
    render(
      <WishFeed
        wishes={[wish]}
        primaryColor="#c8956c"
      />,
    );
    expect(screen.getByText('Khách mời')).toBeTruthy();
  });
});
