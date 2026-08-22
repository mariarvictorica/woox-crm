import React from 'react';
import { OrgProfileField } from '../data/initialData';

interface OrgProfileChecklistBannerProps {
  /** What the Owner still has to fill in — from getOrgMissingFields. */
  missing: OrgProfileField[];
  total: number;
  onComplete: () => void;
}

/**
 * The nudge an Owner sees after the Super Admin onboards their organization
 * with only a name and an owner. It lives in its own file because
 * DashboardView is already past 800 lines, and it has no dismiss control on
 * purpose: it disappears by being resolved, not by being hidden.
 *
 * Styling follows the active-filter bar in LeadsView, which already
 * established the amber notice pattern with the --warn-* ramp.
 */
export const OrgProfileChecklistBanner: React.FC<OrgProfileChecklistBannerProps> = ({
  missing,
  total,
  onComplete
}) => {
  if (missing.length === 0) return null;

  return (
    <div
      id="org-profile-checklist"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        background: 'var(--warn-surface)',
        border: '1px solid var(--warn-border)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', flex: 1, minWidth: '260px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--warn-soft)',
            color: 'var(--warn-ink)',
            flexShrink: 0
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 7h6M9 11h6M9 15h6" />
          </svg>
        </span>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--warn-ink)' }}>
            Completá los datos de tu organización
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--warn-deep)', marginTop: '2px' }}>
            {missing.length === 1
              ? `Falta 1 de ${total} datos para tener la ficha lista.`
              : `Faltan ${missing.length} de ${total} datos para tener la ficha lista.`}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '9px' }}>
            {missing.map(f => (
              <span
                key={f.key}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--warn-ink)',
                  background: 'var(--warn-soft)',
                  border: '1px solid var(--warn-soft-strong)',
                  borderRadius: 'var(--r-sm)',
                  padding: '3px 8px'
                }}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-complete-org-profile"
        className="btn btn-primary btn-sm"
        onClick={onComplete}
        style={{ flexShrink: 0 }}
      >
        Completar datos
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
};
