import React from 'react';

export interface AttentionItem {
  key: string;
  /** What is wrong, stated as a count of things. */
  label: string;
  count: number;
  /** Reads as "N <label> · <detail>" — the why, or which ones. */
  detail?: string;
  ctaLabel: string;
  onAction: () => void;
  /** Ranks above the rest: a neglected priority lead costs more than a stale one. */
  urgent?: boolean;
}

interface DashboardAttentionPanelProps {
  items: AttentionItem[];
}

/**
 * The first thing a Manager sees: what needs doing, not what happened.
 *
 * Replaces two things that used to compete for the same job — a standalone
 * "contacts without an opportunity" KPI and the organization-profile notice,
 * which sat in different places and neither of which read as a queue.
 *
 * Only items with a non-zero count are passed in, so an empty list means
 * genuinely nothing pending and says so, rather than rendering blank rows.
 */
export const DashboardAttentionPanel: React.FC<DashboardAttentionPanelProps> = ({ items }) => {
  const allClear = items.length === 0;

  return (
    <div className="manager-card" id="card-attention">
      <div className="manager-card-head">
        <h3>Necesita tu atención</h3>
        {!allClear && (
          <span className="head-meta">
            {items.length} {items.length === 1 ? 'pendiente' : 'pendientes'}
          </span>
        )}
      </div>

      {allClear ? (
        <div className="attention-clear" id="attention-all-clear">
          <span className="attention-clear-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div>
            <div className="attention-clear-title">Todo en orden</div>
            <div className="attention-clear-sub">
              No hay contactos sin seguimiento ni datos pendientes.
            </div>
          </div>
        </div>
      ) : (
        <div id="attention-item-list">
          {items.map(item => (
            <button
              key={item.key}
              type="button"
              id={`attention-item-${item.key}`}
              className={`attention-row ${item.urgent ? 'is-urgent' : ''}`}
              onClick={item.onAction}
            >
              <span className="attention-count" aria-hidden="true">
                {item.count}
              </span>
              <span className="attention-text">
                <span className="attention-label">{item.label}</span>
                {item.detail && <span className="attention-detail">{item.detail}</span>}
              </span>
              <span className="attention-cta">
                {item.ctaLabel}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
