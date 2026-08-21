import React, { useEffect, useRef, useState } from 'react';

export interface RowMenuAction {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}

interface RowMenuProps {
  actions: RowMenuAction[];
  /** Names what the menu belongs to, e.g. "Opciones de Woox Pinturas". */
  ariaLabel: string;
}

/**
 * Ellipsis action menu for a table row.
 *
 * Generalized from the note action menu (LeadDetailView / OpportunityDetailView)
 * so a third and later usage doesn't hand-roll its own dropdown again.
 */
export const RowMenu: React.FC<RowMenuProps> = ({ actions, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      className="row-menu-wrap"
      ref={wrapRef}
      // Rows this menu sits in are usually themselves clickable (e.g. to open
      // a detail view) — stop the click here so opening the menu never also
      // triggers the row.
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        className={`row-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="12" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="row-menu-dropdown" role="menu">
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              className={`row-menu-item ${action.tone === 'danger' ? 'danger' : ''}`}
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
