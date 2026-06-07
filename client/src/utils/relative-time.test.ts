import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime, formatAbsolute } from './relative-time';

const NOW = new Date('2026-06-07T10:00:00Z').getTime();

afterEach(() => {
  vi.useRealTimers();
});

describe('formatRelativeTime', () => {
  it('returns "Vừa xong" for diffs under a minute', () => {
    expect(formatRelativeTime(NOW - 5 * 1000, NOW)).toBe('Vừa xong');
    expect(formatRelativeTime(NOW - 45 * 1000, NOW)).toBe('Vừa xong');
  });

  it('returns minutes for diffs under an hour', () => {
    expect(formatRelativeTime(NOW - 60 * 1000, NOW)).toBe('1 phút trước');
    expect(formatRelativeTime(NOW - 5 * 60 * 1000, NOW)).toBe('5 phút trước');
    expect(formatRelativeTime(NOW - 59 * 60 * 1000, NOW)).toBe('59 phút trước');
  });

  it('returns hours for diffs under a day', () => {
    expect(formatRelativeTime(NOW - 60 * 60 * 1000, NOW)).toBe('1 giờ trước');
    expect(formatRelativeTime(NOW - 3 * 60 * 60 * 1000, NOW)).toBe('3 giờ trước');
    expect(formatRelativeTime(NOW - 23 * 60 * 60 * 1000, NOW)).toBe('23 giờ trước');
  });

  it('returns days for diffs under a week', () => {
    expect(formatRelativeTime(NOW - 24 * 60 * 60 * 1000, NOW)).toBe('1 ngày trước');
    expect(formatRelativeTime(NOW - 6 * 24 * 60 * 60 * 1000, NOW)).toBe('6 ngày trước');
  });

  it('returns absolute date for diffs of a week or more', () => {
    expect(formatRelativeTime(NOW - 8 * 24 * 60 * 60 * 1000, NOW)).toBe(formatAbsolute(new Date(NOW - 8 * 24 * 60 * 60 * 1000)));
  });

  it('returns absolute date for future timestamps', () => {
    expect(formatRelativeTime(NOW + 60 * 1000, NOW)).toBe(formatAbsolute(new Date(NOW + 60 * 1000)));
  });

  it('returns empty string for invalid input', () => {
    expect(formatRelativeTime(NaN, NOW)).toBe('');
  });

  it('accepts Date instances', () => {
    expect(formatRelativeTime(new Date(NOW - 5 * 60 * 1000), NOW)).toBe('5 phút trước');
  });
});
