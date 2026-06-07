import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && options && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4"
          onClick={() => close(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="confirm-dialog-title" className="text-lg font-semibold mb-2">
              {options.title || 'Xác nhận'}
            </h4>
            <p className="text-sm text-gray-600 mb-6">{options.message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {options.cancelLabel || 'Hủy'}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                data-testid="confirm-yes"
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  options.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-dark hover:bg-black'
                }`}
              >
                {options.confirmLabel || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
