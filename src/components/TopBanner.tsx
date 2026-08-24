import React from 'react';
import { DesignSystem, PlatformRole } from '../types';
import { DropdownMenu } from './DropdownMenu';
import { PLATFORM_VIEW_OPTIONS } from '../data/initialData';

interface TopBannerProps {
  designSystem: DesignSystem;
  onToggleDesignSystem: () => void;
  /** Which panel is being viewed. Sits here rather than in the sidebar so the
   *  top bar owns app-level switching and the sidebar foot owns the account. */
  role: PlatformRole;
  onSwitchRole: (role: PlatformRole) => void;
}

/**
 * Always-rendered top bar — the one place guaranteed to be on every screen
 * regardless of role or view, which is why the design-system switch lives
 * here rather than as a new floating control. (The sidebar's own
 * light/dark toggle lives in Sidebar.tsx instead, since it's a
 * sidebar-level setting, not an app-wide one.)
 */
export const TopBanner: React.FC<TopBannerProps> = ({
  designSystem,
  onToggleDesignSystem,
  role,
  onSwitchRole
}) => {
  const isDublinks = designSystem === 'dublinks';
  const currentView = PLATFORM_VIEW_OPTIONS.find(o => o.value === role);

  return (
    <div className="preview-banner" id="preview-banner">
      Prototipo interactivo &mdash; <span>datos de ejemplo</span> para revisar el enfoque de V1 con el equipo

      <div className="preview-switches">
        <DropdownMenu
          ariaLabel="Cambiar de vista"
          items={PLATFORM_VIEW_OPTIONS.map(o => ({
            label: o.label,
            selected: o.value === role,
            onClick: () => onSwitchRole(o.value)
          }))}
          renderTrigger={({ isOpen, toggle }) => (
            <button
              type="button"
              id="btn-view-switcher"
              className={`view-switcher-trigger ${isOpen ? 'active' : ''}`}
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={isOpen}
            >
              <span className="view-switcher-label">Vista</span>
              <span className="view-switcher-value">{currentView?.label || role}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        />

        <div className="design-system-switch" id="design-system-switch">
          <span className={`design-system-switch-label ${!isDublinks ? 'active' : ''}`}>Diseño actual</span>
          <button
            type="button"
            role="switch"
            aria-checked={isDublinks}
            aria-label={`Cambiar a ${isDublinks ? 'Diseño actual' : 'Diseño nuevo'}`}
            className={`design-system-switch-track ${isDublinks ? 'on' : ''}`}
            onClick={onToggleDesignSystem}
          >
            <span className="design-system-switch-knob" />
          </button>
          <span className={`design-system-switch-label ${isDublinks ? 'active' : ''}`}>Diseño nuevo</span>
        </div>
      </div>
    </div>
  );
};
