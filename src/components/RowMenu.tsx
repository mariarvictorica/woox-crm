import React from 'react';
import { DropdownMenu } from './DropdownMenu';

export interface RowMenuAction {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}

interface RowMenuProps {
  actions: RowMenuAction[];
  /** Names what the menu belongs to, e.g. "Opciones de Pinturerias Garin". */
  ariaLabel: string;
}

/**
 * Ellipsis action menu for a table row.
 *
 * The dropdown behaviour now lives in DropdownMenu, shared with the sidebar's
 * account menu and the top bar's view selector. This keeps its own public API
 * so every table using it is untouched.
 */
export const RowMenu: React.FC<RowMenuProps> = ({ actions, ariaLabel }) => (
  <DropdownMenu
    items={actions}
    ariaLabel={ariaLabel}
    // Rows are usually clickable themselves, so opening the menu must not
    // also open the row's detail view.
    stopPropagation
    renderTrigger={({ isOpen, toggle }) => (
      <button
        type="button"
        className={`row-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={toggle}
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
    )}
  />
);
