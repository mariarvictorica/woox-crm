import React, { useEffect, useRef, useState } from 'react';

export interface DropdownMenuItem {
  /** Also the React key, so keep it unique within one menu. */
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
  /** Marks the current choice in a selector-style menu. */
  selected?: boolean;
  icon?: React.ReactNode;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  ariaLabel: string;
  /** Rendered as the trigger. `isOpen` lets it show its own open state. */
  renderTrigger: (state: { isOpen: boolean; toggle: () => void }) => React.ReactNode;
  /** 'up' for triggers near the bottom of the viewport, e.g. the sidebar foot. */
  direction?: 'down' | 'up';
  align?: 'left' | 'right';
  /** Extra class on the surface, for width or theme tweaks per call site. */
  menuClassName?: string;
  /** Stops the toggle click from reaching a clickable ancestor. */
  stopPropagation?: boolean;
}

/**
 * The menu mechanics every dropdown in the app needs: outside-click and
 * Escape to close, menu/menuitem roles, and closing before the action runs.
 *
 * Extracted from RowMenu when the sidebar's account menu and the top bar's
 * view selector both needed the same behaviour. RowMenu is now a thin wrapper
 * over this, so there is one implementation rather than three that drift.
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  ariaLabel,
  renderTrigger,
  direction = 'down',
  align = 'right',
  menuClassName = '',
  stopPropagation = false
}) => {
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

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div
      className="row-menu-wrap"
      ref={wrapRef}
      onClick={stopPropagation ? e => e.stopPropagation() : undefined}
    >
      {renderTrigger({ isOpen, toggle })}

      {isOpen && (
        <div
          className={`row-menu-dropdown ${direction === 'up' ? 'drop-up' : ''} ${
            align === 'left' ? 'align-left' : ''
          } ${menuClassName}`}
          role="menu"
          aria-label={ariaLabel}
        >
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              className={`row-menu-item ${item.tone === 'danger' ? 'danger' : ''} ${
                item.selected ? 'is-selected' : ''
              }`}
              role="menuitem"
              aria-current={item.selected ? 'true' : undefined}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.selected && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
