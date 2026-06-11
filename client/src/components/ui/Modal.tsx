import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Shared modal shell. Renders into document.body via portal so it escapes
 * any flex/grid parent constraints (the root cause of the "60px-wide
 * collapsed modal" bug that affected ImportGuestsModal, ConfirmDialog, etc).
 *
 * Width is clamped to `min(100% - 2rem, maxWidth)` so the panel can never
 * shrink to a parent's min-content size.
 *
 * Usage:
 *   <Modal open onClose={() => ...} maxWidth="md">
 *     <your-content />
 *   </Modal>
 *
 * The backdrop click + Escape close is wired by default. If the consumer
 * needs to disable backdrop-dismiss (e.g. destructive form), pass
 * `dismissOnBackdrop={false}`.
 */
export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const MAX_WIDTH_CLASS: Record<ModalMaxWidth, string> = {
  sm: '24rem',   // 384px
  md: '28rem',   // 448px
  lg: '32rem',   // 512px
  xl: '36rem',   // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: ModalMaxWidth;
  /** z-index for the overlay. Default 50. Use 90 for confirm dialogs stacked over other modals. */
  zIndex?: number;
  /** Close when the backdrop is clicked. Default true. */
  dismissOnBackdrop?: boolean;
  /** Close on Escape key. Default true. */
  dismissOnEscape?: boolean;
  /** Additional classes for the inner panel (e.g. custom padding). */
  panelClassName?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'lg',
  zIndex = 50,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  panelClassName = '',
}: ModalProps) {
  // Escape to close
  useEffect(() => {
    if (!open || !dismissOnEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismissOnEscape, onClose]);

  // Lock body scroll while open so the page behind doesn't shift
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex }}
      onClick={dismissOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${panelClassName}`}
        style={{ width: `min(calc(100% - 2rem), ${MAX_WIDTH_CLASS[maxWidth]})` }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
