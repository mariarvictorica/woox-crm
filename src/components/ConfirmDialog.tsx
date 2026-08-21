import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  /** States the decision: "¿Descartar este contacto?" */
  title: string;
  body: React.ReactNode;
  /** Names the outcome, never "OK": "Descartar", "Eliminar usuario". */
  confirmLabel: string;
  cancelLabel?: string;
  /** 'danger' for irreversible actions, 'warn' for discarding input. */
  tone?: 'danger' | 'warn';
  onConfirm: () => void;
  onCancel: () => void;
  id?: string;
  /** Widen for confirmations that carry a form control (e.g. reassignment). */
  width?: string;
  /** Blocks the destructive action until a prerequisite is met. */
  confirmDisabled?: boolean;
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])';

/**
 * Confirmation dialog for destructive or data-losing actions.
 *
 * The app had ten of these hand-rolled, none of which handled Escape or kept
 * focus inside, so a keyboard user could tab straight out to the page behind
 * a blocking confirm. Focus starts on the safe (cancel) action deliberately,
 * so Enter never destroys anything by accident.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
  id,
  width,
  confirmDisabled = false
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => cancelRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const trigger = triggerRef.current;
    if (trigger && document.body.contains(trigger)) trigger.focus();
    triggerRef.current = null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const nodes: HTMLElement[] = Array.from<HTMLElement>(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" id={id}>
      <div
        className="confirm-dialog"
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        style={width ? { maxWidth: width } : undefined}
      >
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${tone}`}>
            {tone === 'danger' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <div className="confirm-dialog-title">{title}</div>
        </div>
        <div className="confirm-dialog-body">{body}</div>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} ref={cancelRef}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
