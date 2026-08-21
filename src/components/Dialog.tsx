import React, { useEffect, useRef, useCallback } from 'react';

export type DialogVariant = 'modal' | 'drawer';

interface DialogProps {
  isOpen: boolean;
  /** The task, stated plainly: "Agregar contacto", not the feature's internal name. */
  title: string;
  /** Optional one-line description of the task. */
  subtitle?: string;
  variant?: DialogVariant;
  /** Width override. Defaults: modal 560px, drawer 520px. */
  width?: string;
  /** Dialog id, so callers keep their existing DOM hooks. */
  id?: string;
  /**
   * True while the form holds input the user would lose on close. When set,
   * Escape / X / click-outside route through onRequestDiscard instead of
   * closing outright.
   */
  isDirty?: boolean;
  onRequestDiscard?: () => void;
  onClose: () => void;
  /** Rendered in the sticky footer, right-aligned: secondary first, primary last. */
  footer?: React.ReactNode;
  /** Wraps body+footer in a <form> so Enter submits, matching native behavior. */
  onSubmit?: (e: React.FormEvent) => void;
  formId?: string;
  children: React.ReactNode;
}

// Everything focusable we need to cycle through for the focus trap.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared chrome for every modal and drawer in the app.
 *
 * Exists because the 12 dialogs each reimplemented their own overlay, header
 * and footer, and drifted: only 4 handled Escape, 2 had no X button, none
 * trapped focus or returned it to the trigger, and 10 discarded unsaved input
 * silently. Centralizing it means those behaviors can't diverge again.
 */
export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  subtitle,
  variant = 'modal',
  width,
  id,
  isDirty = false,
  onRequestDiscard,
  onClose,
  footer,
  onSubmit,
  formId,
  children
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  // The element that had focus before opening, so we can hand it back.
  const triggerRef = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    if (isDirty && onRequestDiscard) {
      onRequestDiscard();
    } else {
      onClose();
    }
  }, [isDirty, onRequestDiscard, onClose]);

  // Remember the trigger, then move focus into the dialog.
  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    const t = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      // Prefer whatever the caller marked autoFocus; else the first control.
      const preferred = panel.querySelector<HTMLElement>('[data-autofocus]');
      if (preferred) {
        preferred.focus();
        return;
      }
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      if (first) first.focus();
    }, 60);

    return () => clearTimeout(t);
  }, [isOpen]);

  // Return focus to the trigger on close.
  useEffect(() => {
    if (isOpen) return;
    const trigger = triggerRef.current;
    if (trigger && document.body.contains(trigger)) {
      trigger.focus();
    }
    triggerRef.current = null;
  }, [isOpen]);

  // Escape to dismiss + Tab cycling kept inside the panel.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const nodes: HTMLElement[] = Array.from<HTMLElement>(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(el => el.offsetParent !== null || el === document.activeElement);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      // Wrap at the edges; if focus somehow escaped, pull it back in.
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
  }, [isOpen, requestClose]);

  if (!isOpen) return null;

  const isDrawer = variant === 'drawer';
  const titleId = `${id || 'dialog'}-title`;

  const body = (
    <>
      <div className="dialog-body">{children}</div>
      {footer && <div className="dialog-foot">{footer}</div>}
    </>
  );

  return (
    <div
      className={isDrawer ? 'opp-drawer-overlay' : 'modal-overlay open'}
      onMouseDown={e => {
        // mousedown, not click: a click that started inside the panel and
        // ended on the overlay (text selection drag) shouldn't dismiss.
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        className={isDrawer ? 'opp-drawer dialog-panel' : 'modal dialog-panel'}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={width ? { width } : undefined}
      >
        <div className="dialog-head">
          <div className="dialog-title-wrap">
            <h2 id={titleId} className="dialog-title">
              {title}
            </h2>
            {subtitle && <p className="dialog-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={requestClose}
            title="Cerrar (Esc)"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {onSubmit ? (
          // noValidate: the app owns validation, so errors render inline next
          // to the field in our own wording. Without it the browser intercepts
          // submit first and shows its own native tooltip instead, which never
          // reaches our validators and varies by browser locale.
          <form id={formId} onSubmit={onSubmit} className="dialog-form" noValidate>
            {body}
          </form>
        ) : (
          body
        )}
      </div>
    </div>
  );
};
