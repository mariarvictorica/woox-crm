import React, { useState } from 'react';

interface OrgProfileChecklistBannerProps {
  /** How many profile fields are filled in. */
  completed: number;
  total: number;
  onComplete: () => void;
}

const STORAGE_KEY = 'org-profile-banner-collapsed';

/**
 * The nudge an Owner sees after the Super Admin onboards their organization
 * with only a name and an owner.
 *
 * Reports progress as a number and a bar, never as a list of what's missing:
 * naming each gap made the banner grow with the work left and read as a
 * to-do list on the Dashboard, which is not where that work happens. The
 * props are counts only, so the field names can't leak back in here.
 *
 * Collapsing is remembered across visits — same reason and same mechanism as
 * the notes policy banner. Without it the preference would reset every time
 * the Dashboard remounts, which is every time the Owner navigates back.
 */
export const OrgProfileChecklistBanner: React.FC<OrgProfileChecklistBannerProps> = ({
  completed,
  total,
  onComplete
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  if (completed >= total) return null;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const count = (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
      {completed}/{total}
    </span>
  );

  return (
    <div
      id="org-profile-checklist"
      style={{
        background: 'var(--warn-surface)',
        border: '1px solid var(--warn-border)',
        borderRadius: 'var(--r-lg)',
        padding: collapsed ? '9px 14px' : '12px 14px',
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

        <div style={{ flex: 1, minWidth: 0, fontSize: '13px', color: 'var(--warn-ink)' }}>
          {count} datos completados para tu perfil de organización
        </div>

        <button
          type="button"
          id="btn-complete-org-profile"
          className="btn btn-primary btn-sm"
          onClick={onComplete}
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
          aria-controls="org-profile-progress"
          aria-label={collapsed ? 'Mostrar el progreso' : 'Ocultar el progreso'}
          title={collapsed ? 'Mostrar el progreso' : 'Ocultar el progreso'}
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
        <div
          id="org-profile-progress"
          className="stage-track"
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Progreso del perfil de la organización"
          style={{ marginTop: '10px' }}
        >
          <div className="stage-fill" style={{ width: `${pct}%`, background: 'var(--warn)' }} />
        </div>
      )}
    </div>
  );
};
