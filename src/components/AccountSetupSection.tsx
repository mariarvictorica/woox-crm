import React, { useEffect, useRef, useState } from 'react';
import { OrgProfileProgressBar } from './OrgProfileProgressBar';

/** Long enough to read as a movement, short enough not to delay anything. */
const EXIT_MS = 250;

export type SetupRowKey = 'profile' | 'organization';

/** Fixed order, so a row leaving never makes the other one jump. */
const ROW_ORDER: SetupRowKey[] = ['profile', 'organization'];

export interface SetupRow {
  key: SetupRowKey;
  label: string;
  /** What is still missing, in the user's words. */
  hint: string;
  completed: number;
  total: number;
  onComplete: () => void;
}

interface AccountSetupSectionProps {
  /**
   * Only the rows that apply to this user AND are still incomplete. The caller
   * decides that — each row is evaluated on its own, and a Rep never gets the
   * organization row whatever the state of that data.
   *
   * Must be memoized: identity changes drive the exit transitions.
   */
  rows: SetupRow[];
  /** "Más tarde" — one action that puts the whole section away for good. */
  onDismiss: () => void;
}

/**
 * The one place a user is asked to finish setting up: their own profile, and —
 * if they own the organization — the company's data.
 *
 * It replaced two separate banners. They were never independent tasks in the
 * user's head, only in ours: an Owner with both pending saw two amber blocks
 * stacked, each with its own progress bar and its own way of being dismissed.
 * One card with one row per pending thing says the same and asks once.
 *
 * Collapsing and dismissing are different, deliberately. The chevron hides the
 * body for the session and nothing more; "Más tarde" is the permanent choice and
 * the only one that gets recorded on the user.
 *
 * Deliberately isolated: it does not share data, layout or state with the
 * attention queue or any other dashboard block.
 */
export const AccountSetupSection: React.FC<AccountSetupSectionProps> = ({ rows, onDismiss }) => {
  const [collapsed, setCollapsed] = useState(false);
  /** Rows that left the incoming set and are still animating out. */
  const [leaving, setLeaving] = useState<SetupRowKey[]>([]);
  /** True while the whole card animates away — completed or dismissed. */
  const [exiting, setExiting] = useState(false);

  // Last known content of every row, so one can still be drawn while it leaves.
  const cache = useRef<Map<SetupRowKey, SetupRow>>(new Map());
  rows.forEach(r => cache.current.set(r.key, r));

  const previousKeys = useRef<SetupRowKey[]>(rows.map(r => r.key));
  const hasShown = useRef(rows.length > 0);
  const dismissTimer = useRef<number | null>(null);

  // A row finished while others remain: fade that row. When the last one goes,
  // the whole card leaves instead — see the effect below — so this stays out of
  // the way rather than animating twice.
  useEffect(() => {
    const current = rows.map(r => r.key);
    const gone = previousKeys.current.filter(k => !current.includes(k));
    previousKeys.current = current;
    if (gone.length === 0 || current.length === 0) return;

    setLeaving(prev => [...prev, ...gone]);
    const t = window.setTimeout(
      () => setLeaving(prev => prev.filter(k => !gone.includes(k))),
      EXIT_MS
    );
    return () => window.clearTimeout(t);
  }, [rows]);

  // Nothing left pending: the card fades and then goes. Clearing `exiting` at
  // the end is what actually unmounts it — left set, an invisible card would
  // keep its space in the layout.
  useEffect(() => {
    if (rows.length > 0) {
      hasShown.current = true;
      setExiting(false);
      return;
    }
    // Already faded out once, or never shown: make sure nothing is left behind.
    if (!hasShown.current) {
      setExiting(false);
      setLeaving([]);
      return;
    }
    setExiting(true);
    const t = window.setTimeout(() => {
      hasShown.current = false;
      setExiting(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [rows]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    };
  }, []);

  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    dismissTimer.current = window.setTimeout(() => {
      // `exiting` deliberately stays set: the parent is about to empty `rows`,
      // and the effect above unmounts from there. Clearing it here would show
      // the card at full opacity again for a frame before it goes.
      hasShown.current = false;
      onDismiss();
    }, EXIT_MS);
  };

  // Rows to draw: the live ones, plus any still on their way out, always in the
  // canonical order.
  const display = ROW_ORDER.map(key => {
    const live = rows.find(r => r.key === key);
    if (live) return { row: live, leaving: false };
    if (leaving.includes(key)) {
      const cached = cache.current.get(key);
      if (cached) return { row: cached, leaving: true };
    }
    return null;
  }).filter((e): e is { row: SetupRow; leaving: boolean } => e !== null);

  if (display.length === 0 && !exiting) return null;

  // Counted from the incoming set, not from what is on screen, so finishing a
  // row updates the header immediately. Never rendered at zero.
  const pending = rows.length;

  return (
    <div
      className={`setup-card ${exiting ? 'is-exiting' : ''}`}
      id="account-setup"
      aria-hidden={exiting}
    >
      <div className="setup-head">
        <span aria-hidden="true" className="setup-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </span>

        <h3 className="setup-title" id="account-setup-title">
          Termina de configurar tu cuenta
          {pending > 0 && (
            <span className="setup-count">
              {' — '}
              {pending} {pending === 1 ? 'pendiente' : 'pendientes'}
            </span>
          )}
        </h3>

        <button
          type="button"
          id="btn-setup-later"
          className="btn btn-ghost btn-sm"
          onClick={handleDismiss}
        >
          Más tarde
        </button>

        <button
          type="button"
          id="btn-setup-toggle"
          className="setup-toggle"
          onClick={() => setCollapsed(prev => !prev)}
          aria-expanded={!collapsed}
          aria-controls="account-setup-body"
          aria-label={collapsed ? 'Mostrar qué falta' : 'Ocultar qué falta'}
          title={collapsed ? 'Mostrar qué falta' : 'Ocultar qué falta'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.18s var(--ease)'
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="setup-body" id="account-setup-body">
          {display.map(({ row, leaving: isLeaving }) => (
            <div
              key={row.key}
              className={`setup-row ${isLeaving ? 'is-leaving' : ''}`}
              id={`setup-row-${row.key}`}
            >
              <div className="setup-row-text">
                <span className="setup-row-label">{row.label}</span>
                <span className="setup-row-hint">{row.hint}</span>
              </div>

              <div className="setup-row-progress">
                <span className="setup-row-count">
                  {row.completed}/{row.total} campos
                </span>
                <OrgProfileProgressBar
                  id={`setup-progress-${row.key}`}
                  completed={row.completed}
                  total={row.total}
                  label={`Progreso de ${row.label.toLowerCase()}`}
                />
              </div>

              <button
                type="button"
                id={`btn-setup-complete-${row.key}`}
                className="btn btn-secondary btn-sm"
                onClick={row.onComplete}
              >
                Completar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
