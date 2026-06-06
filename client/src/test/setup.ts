import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement IntersectionObserver; framer-motion's
// whileInView triggers it on mount. Stub it to a no-op.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;
if (typeof window !== 'undefined' && !(window as any).IntersectionObserver) {
  (window as any).IntersectionObserver = MockIntersectionObserver;
}

// jsdom does not implement HTMLMediaElement.play/pause; some components
// instantiate <audio> on mount.
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});
