import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TTL_MS = 4000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => remove(id), TOAST_TTL_MS);
    },
    [remove]
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const color =
    toast.variant === 'success'
      ? 'bg-green-600'
      : toast.variant === 'error'
        ? 'bg-red-600'
        : 'bg-gray-800';

  const icon = toast.variant === 'success' ? '✓' : toast.variant === 'error' ? '⚠' : 'ℹ';

  return (
    <div
      role="status"
      data-testid="toast"
      data-variant={toast.variant}
      className={`${color} text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 min-w-[280px] pointer-events-auto animate-fade-in`}
    >
      <span aria-hidden="true" className="font-bold">
        {icon}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
