import React from 'react';
import { DesignSystem, PlatformRole } from '../types';
import { DropdownMenu } from './DropdownMenu';
import { PLATFORM_VIEW_OPTIONS, DESIGN_SYSTEM_OPTIONS } from '../data/initialData';

interface TopBannerProps {
  designSystem: DesignSystem;
  /** Sets the design system outright. Was a two-state toggle; with a third
   *  option a toggle can no longer express the choice. */
  onSelectDesignSystem: (system: DesignSystem) => void;
  /** Which panel is being viewed. Sits here rather than in the sidebar so the
   *  top bar owns app-level switching and the sidebar foot owns the account. */
  role: PlatformRole;
  onSwitchRole: (role: PlatformRole) => void;
  /** Hidden while signed out: there is no view to switch to yet. */
  showViewSwitcher?: boolean;
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
  onSelectDesignSystem,
  role,
  onSwitchRole,
  showViewSwitcher = true
}) => {
  const currentView = PLATFORM_VIEW_OPTIONS.find(o => o.value === role);
  const currentSystem = DESIGN_SYSTEM_OPTIONS.find(o => o.value === designSystem);

  return (
    <div className="preview-banner" id="preview-banner">
      Prototipo interactivo &mdash; <span>datos de ejemplo</span> para revisar el enfoque de V1 con el equipo

      <div className="preview-switches">
        {showViewSwitcher && (
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
        )}

        <DropdownMenu
          ariaLabel="Cambiar de sistema de diseño"
          items={DESIGN_SYSTEM_OPTIONS.map(o => ({
            label: o.label,
            selected: o.value === designSystem,
            onClick: () => onSelectDesignSystem(o.value)
          }))}
          renderTrigger={({ isOpen, toggle }) => (
            <button
              type="button"
              id="btn-design-system-switcher"
              className={`view-switcher-trigger ${isOpen ? 'active' : ''}`}
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              title={currentSystem?.description}
            >
              <span className="view-switcher-label">Diseño</span>
              <span className="view-switcher-value">{currentSystem?.label || designSystem}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        />
      </div>
    </div>
  );
};
