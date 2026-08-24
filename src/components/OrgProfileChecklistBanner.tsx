import React, { useState } from 'react';
import { OrgProfileField, OrgProfileFieldKey } from '../data/initialData';

interface OrgProfileChecklistBannerProps {
  /** Fields still empty. Rendered as shortcuts, one per field. */
  missing: OrgProfileField[];
  total: number;
  /** Called with a field key to jump straight to it, or with nothing for the
   *  general CTA. */
  onComplete: (field?: OrgProfileFieldKey) => void;
}

const STORAGE_KEY = 'org-profile-banner-collapsed';

/**
 * The nudge an Owner sees after the Super Admin onboards their organization
 * with only a name and an owner.
 *
 * The bar answers "how far along am I" and stays in both states, since that
 * is the part worth keeping visible at all times. Collapsing hides only the
 * per-field shortcuts and moves the bar inline, which is what actually costs
 * vertical space.
 */
export const OrgProfileChecklistBanner: React.FC<OrgProfileChecklistBannerProps> = ({
  missing,
  total,
  onComplete
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const completed = total - missing.length;
  if (missing.length === 0) return null;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const bar = (
    <div
      id="org-profile-progress"
      className="stage-track"
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Progreso del perfil de la organización"
    >
      <div className="stage-fill" style={{ width: `${pct}%`, background: 'var(--warn)' }} />
    </div>
  );

  return (
    <div
      id="org-profile-checklist"
      style={{
        background: 'var(--warn-surface)',
        border: '1px solid var(--warn-border)',
        borderRadius: 'var(--r-lg)',
        padding: collapsed ? '10px 14px' : '12px 14px',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--warn-soft)',
            color: 'var(--warn-ink)',
            flexShrink: 0
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 7h6M9 11h6M9 15h6" />
          </svg>
        </span>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--warn-ink)',
            flexShrink: 0,
            ...(collapsed ? {} : { flex: 1, minWidth: 0 })
          }}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
            {completed}/{total}
          </span>{' '}
          datos completados{collapsed ? '' : ' para tu perfil de organización'}
        </div>

        {/* Collapsed, the bar rides in the header row instead of adding a line
            of its own — that is the only way to keep it visible and still be
            shorter than the expanded state. */}
        {collapsed && <div style={{ flex: 1, minWidth: '80px' }}>{bar}</div>}

        <button
          type="button"
          id="btn-complete-org-profile"
          className="btn btn-primary btn-sm"
          onClick={() => onComplete()}
          style={{ flexShrink: 0 }}
        >
          Completar
        </button>

        <button
          type="button"
          id="btn-toggle-org-profile-banner"
          className="btn btn-ghost btn-sm"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="org-profile-missing-list"
          aria-label={collapsed ? 'Mostrar qué datos faltan' : 'Ocultar qué datos faltan'}
          title={collapsed ? 'Mostrar qué datos faltan' : 'Ocultar qué datos faltan'}
          style={{ flexShrink: 0, padding: '4px 6px', color: 'var(--warn-ink)' }}
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
        <>
          <div style={{ marginTop: '10px' }}>{bar}</div>

          <div
            id="org-profile-missing-list"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}
          >
            {missing.map(f => (
              <button
                key={f.key}
                type="button"
                id={`org-profile-missing-${f.key}`}
                className="org-profile-missing-chip"
                onClick={() => onComplete(f.key)}
                title={`Completar ${f.label.toLowerCase()}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
