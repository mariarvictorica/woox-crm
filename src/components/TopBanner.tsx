import React from 'react';
import { DesignSystem } from '../types';

interface TopBannerProps {
  designSystem: DesignSystem;
  onToggleDesignSystem: () => void;
}

/**
 * Always-rendered top bar — the one place guaranteed to be on every screen
 * regardless of role or view, which is why the design-system switch lives
 * here rather than as a new floating control. (The sidebar's own
 * light/dark toggle lives in Sidebar.tsx instead, since it's a
 * sidebar-level setting, not an app-wide one.)
 */
export const TopBanner: React.FC<TopBannerProps> = ({ designSystem, onToggleDesignSystem }) => {
  const isDublinks = designSystem === 'dublinks';

  return (
    <div className="preview-banner" id="preview-banner">
      Prototipo interactivo &mdash; <span>datos de ejemplo</span> para revisar el enfoque de V1 con el equipo

      <div className="preview-switches">
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
