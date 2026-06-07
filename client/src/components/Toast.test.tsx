import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

function Demo() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Saved')}>s</button>
      <button onClick={() => toast.error('Boom')}>e</button>
      <button onClick={() => toast.info('FYI')}>i</button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a success toast with the success variant', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('s'));
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('data-variant', 'success');
    expect(toast).toHaveTextContent('Saved');
  });

  it('renders an error toast with the error variant', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('e'));
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('data-variant', 'error');
    expect(toast).toHaveTextContent('Boom');
  });

  it('auto-dismisses after TTL', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('s'));
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('throws if useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Demo />)).toThrow(/ToastProvider/);
    consoleError.mockRestore();
  });
});
