import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { useState } from 'react';
import { ConfirmProvider, useConfirm } from './ConfirmDialog';

function Demo() {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<string>('idle');
  return (
    <div>
      <p data-testid="answer">{answer}</p>
      <button
        onClick={async () => {
          const ok = await confirm({ message: 'Are you sure?', variant: 'danger' });
          setAnswer(ok ? 'yes' : 'no');
        }}
      >
        ask
      </button>
    </div>
  );
}

describe('ConfirmDialog', () => {
  beforeEach(() => {
    cleanup();
  });

  it('opens the dialog and resolves true when confirm is clicked', async () => {
    render(
      <ConfirmProvider>
        <Demo />
      </ConfirmProvider>
    );
    fireEvent.click(screen.getByText('ask'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-yes'));
    });

    expect(screen.getByTestId('answer')).toHaveTextContent('yes');
  });

  it('resolves false when cancel is clicked', async () => {
    render(
      <ConfirmProvider>
        <Demo />
      </ConfirmProvider>
    );
    fireEvent.click(screen.getByText('ask'));
    await screen.findByRole('dialog');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    });

    expect(screen.getByTestId('answer')).toHaveTextContent('no');
  });
});
