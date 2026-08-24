import React, { useEffect } from 'react';
import { PlatformRole, SidebarMode, ViewType, UserMember } from '../types';
import { UserAvatar } from './UserAvatar';
import { DropdownMenu } from './DropdownMenu';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  role: PlatformRole;
  /** Only the Owner of an organization gets the "Mi organización" item. */
  canManageOrganization?: boolean;
  /** The signed-in person, for the account menu. */
  currentUser?: UserMember;
  onEditProfile?: () => void;
  onLogout?: () => void;
  sidebarMode: SidebarMode;
  onToggleSidebarMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  role,
  canManageOrganization = false,
  currentUser,
  onEditProfile,
  onLogout,
  sidebarMode,
  onToggleSidebarMode
}) => {
  const activeNav =
    currentView === 'lead-detail'
      ? 'leads'
      : currentView === 'opp-detail'
      ? 'opportunities'
      : currentView === 'user-detail'
      ? 'users'
      : currentView === 'org-detail' || currentView === 'org-user-detail'
      ? 'organizations'
      : currentView;

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  const displayName = currentUser?.name || 'Enrique Macias';
  const roleLabel = role === 'manager' ? 'Manager' : 'Super Admin';

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      id="sidebar"
      aria-label="Barra lateral de navegación"
    >
      {/* Sidebar Header with Brand and Toggle */}
      <div className="sidebar-header" id="sidebar-header">
        <div
          className="brand"
          id="sidebar-brand"
          onClick={collapsed ? onToggleCollapse : undefined}
          style={{ cursor: collapsed ? 'pointer' : 'default' }}
          title={collapsed ? 'WooX CRM - Clic para expandir' : 'WooX CRM'}
        >
          <div className="brand-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="name">WooX CRM</div>
            <div className="sub">V1 &middot; Prototipo</div>
          </div>
        </div>

        {/* Top collapse icon toggle button */}
        <button
          id="btn-collapse-sidebar"
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir barra lateral (Ctrl + B)' : 'Colapsar barra lateral (Ctrl + B)'}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="toggle-icon"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <path d="m14 9-3 3 3 3" />
          </svg>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="nav" id="sidebar-nav">
        {role === 'superadmin' ? (
          <>
            <button
              id="nav-organizations"
              className={`nav-item ${activeNav === 'organizations' ? 'active' : ''}`}
              onClick={() => onNavigate('organizations')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M9 7h6M9 11h6M9 15h6" />
                </svg>
              </div>
              <span className="label">Organizaciones</span>
              {collapsed && <span className="nav-tooltip">Organizaciones</span>}
            </button>

            <button
              id="nav-superadmin-users"
              className={`nav-item ${activeNav === 'sa-users' ? 'active' : ''}`}
              onClick={() => onNavigate('sa-users')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  <circle cx="18" cy="8" r="2.6" />
                  <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
                </svg>
              </div>
              <span className="label">Usuarios</span>
              {collapsed && <span className="nav-tooltip">Usuarios</span>}
            </button>
          </>
        ) : (
          <>
            <button
              id="nav-dashboard"
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
              </div>
              <span className="label">Dashboard</span>
              {collapsed && <span className="nav-tooltip">Dashboard</span>}
            </button>

            <button
              id="nav-leads"
              className={`nav-item ${activeNav === 'leads' ? 'active' : ''}`}
              onClick={() => onNavigate('leads')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
              </div>
              <span className="label">Contactos</span>
              {collapsed && <span className="nav-tooltip">Contactos</span>}
            </button>

            <button
              id="nav-opportunities"
              className={`nav-item ${activeNav === 'opportunities' ? 'active' : ''}`}
              onClick={() => onNavigate('opportunities')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="5" height="16" rx="1.3" />
                  <rect x="9.5" y="8" width="5" height="12" rx="1.3" />
                  <rect x="16" y="11" width="5" height="9" rx="1.3" />
                </svg>
              </div>
              <span className="label">Oportunidades</span>
              {collapsed && <span className="nav-tooltip">Oportunidades</span>}
            </button>

            <button
              id="nav-users"
              className={`nav-item ${activeNav === 'users' ? 'active' : ''}`}
              onClick={() => onNavigate('users')}
            >
              <div className="nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  <circle cx="18" cy="8" r="2.6" />
                  <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
                </svg>
              </div>
              <span className="label">Usuarios</span>
              {collapsed && <span className="nav-tooltip">Usuarios</span>}
            </button>

            {canManageOrganization && (
              <button
                id="nav-org-management"
                className={`nav-item ${activeNav === 'org-management' ? 'active' : ''}`}
                onClick={() => onNavigate('org-management')}
              >
                <div className="nav-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M9 7h6M9 11h6M9 15h6" />
                  </svg>
                </div>
                <span className="label">Mi organización</span>
                {collapsed && <span className="nav-tooltip">Mi organización</span>}
              </button>
            )}
          </>
        )}
      </nav>

      {/* Light/dark sidebar toggle — a real switch (moon/sun fixed in the
          track, knob slides between them), sitting just above the user
          footer with its own margin so it doesn't crowd the name below. */}
      <div className="sidebar-mode-toggle-wrap">
        <button
          type="button"
          id="sidebar-mode-toggle"
          className={`sidebar-mode-track ${sidebarMode === 'light' ? 'on' : ''}`}
          onClick={onToggleSidebarMode}
          role="switch"
          aria-checked={sidebarMode === 'light'}
          aria-label={`Cambiar a navbar ${sidebarMode === 'light' ? 'oscura' : 'clara'}`}
          title={`Navbar ${sidebarMode === 'light' ? 'clara' : 'oscura'} — clic para cambiar`}
        >
          <svg className="sidebar-mode-icon moon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
          <svg className="sidebar-mode-icon sun" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <span className="sidebar-mode-knob" />
        </button>
      </div>

      {/* Account menu. Switching panels moved to the top bar, so the sidebar
          foot is now purely personal: who you are, and the two things you can
          do about it. */}
      <div className="sidebar-footer" id="sidebar-user-footer">
        <DropdownMenu
          ariaLabel="Menú de cuenta"
          direction="up"
          align="left"
          menuClassName="account-menu"
          items={[
            { label: 'Editar perfil', onClick: () => onEditProfile?.() },
            { label: 'Cerrar sesión', onClick: () => onLogout?.(), tone: 'danger' }
          ]}
          renderTrigger={({ isOpen, toggle }) => (
            <button
              type="button"
              className={`sidebar-footer-identity sidebar-footer-switchable ${isOpen ? 'active' : ''}`}
              id="btn-account-menu"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              title={`${displayName} · ${roleLabel}`}
            >
              <div className="user-avatar-wrap">
                <UserAvatar
                  name={displayName}
                  avatarUrl={currentUser?.avatarUrl}
                  initials={currentUser?.initials}
                  avatarBg={currentUser?.avatarBg}
                  size="md"
                  showOnline={true}
                />
              </div>
              <div className="user-info">
                <div className="who">{displayName}</div>
                <div className="role">{roleLabel}</div>
              </div>
              {!collapsed && (
                <svg
                  className="role-switch-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
              {collapsed && (
                <span className="nav-tooltip user-tooltip">
                  {displayName} &middot; {roleLabel}
                </span>
              )}
            </button>
          )}
        />
      </div>
    </aside>
  );
};
