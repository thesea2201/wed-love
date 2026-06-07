import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharCounter from './CharCounter';

describe('CharCounter', () => {
  it('renders current/max in gray when under warn threshold', () => {
    render(<CharCounter current={10} max={100} />);
    const counter = screen.getByTestId('char-counter');
    expect(counter).toHaveTextContent('10/100');
    expect(counter).toHaveAttribute('data-over', 'false');
    expect(counter).toHaveAttribute('data-warn', 'false');
  });

  it('marks warn state at 90% by default', () => {
    render(<CharCounter current={90} max={100} />);
    const counter = screen.getByTestId('char-counter');
    expect(counter).toHaveAttribute('data-warn', 'true');
    expect(counter).toHaveAttribute('data-over', 'false');
  });

  it('honors custom warnAt', () => {
    render(<CharCounter current={50} max={100} warnAt={0.5} />);
    const counter = screen.getByTestId('char-counter');
    expect(counter).toHaveAttribute('data-warn', 'true');
  });

  it('marks over state when current exceeds max', () => {
    render(<CharCounter current={101} max={100} />);
    const counter = screen.getByTestId('char-counter');
    expect(counter).toHaveAttribute('data-over', 'true');
    expect(counter).toHaveTextContent('101/100');
  });
});
