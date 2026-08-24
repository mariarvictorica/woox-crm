import React, { useState, useEffect, useRef } from 'react';
import { UserMember, Opportunity, Contact, StageKey, ViewType, Organization } from '../types';
import { UserAvatar } from './UserAvatar';
import { EditUserDrawer } from './EditUserDrawer';
import { ConfirmDialog } from './ConfirmDialog';
import { STAGE_LABEL, formatMoney } from '../data/initialData';

interface UserDetailViewProps {
  user: UserMember;
  allUsers: UserMember[];
  /** Used only to detect whether `user` is some organization's Owner, so
   *  deactivating/deleting them can never leave that organization without
   *  one — see `ownedOrgs` below. */
  organizations: Organization[];
  opportunities: Opportunity[];
  contacts?: Contact[];
  onBack: () => void;
  onUpdateUser: (updatedUser: UserMember) => void;
  onDeactivateUser: (userId: number, transferToUserId?: number, newOwnerId?: number) => void;
  onActivateUser?: (userId: number) => void;
  onDeleteUser: (userId: number, transferToUserId?: number, newOwnerId?: number) => void;
  onSelectOpportunity: (oppId: number) => void;
  onSelectLead?: (leadId: number) => void;
  onShowToast: (msg: string) => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  allUsers,
  organizations,
  opportunities,
  contacts = [],
  onBack,
  onUpdateUser,
  onDeactivateUser,
  onActivateUser,
  onDeleteUser,
  onSelectOpportunity,
  onSelectLead,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities'>('overview');
  const [oppFilter, setOppFilter] = useState<'all' | 'open' | 'won' | 'lost'>('all');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Modals state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState<number | ''>('');
  // Unlike transferTargetUserId (optional — a rep's accounts can stay
  // unassigned for a while), this one is mandatory whenever `user` owns an
  // organization: confirm stays disabled until it's set.
  const [newOwnerId, setNewOwnerId] = useState<number | ''>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Sync state if user prop changes
  useEffect(() => {
    setIsEditing(false);
    setShowDeactivateModal(false);
    setShowDeleteModal(false);
    setNewOwnerId('');

    const otherUsers = allUsers.filter(u => u.id !== user.id && u.status === 'Activo');
    if (otherUsers.length > 0) {
      setTransferTargetUserId(otherUsers[0].id);
    } else {
      setTransferTargetUserId('');
    }
  }, [user, allUsers]);

  // Matching rep logic for opportunities and contacts
  const userFirst = user.firstName || user.name.split(' ')[0] || user.name;
  const userOpportunities = opportunities.filter(opp => {
    if (!opp.rep) return false;
    const repClean = opp.rep.trim().toLowerCase();
    return (
      repClean === user.name.toLowerCase() ||
      repClean === userFirst.toLowerCase() ||
      (user.email && repClean === user.email.toLowerCase())
    );
  });

  const userLeads = contacts.filter(c => {
    if (!c.owner) return false;
    const ownerClean = c.owner.trim().toLowerCase();
    return (
      ownerClean === user.name.toLowerCase() ||
      ownerClean === userFirst.toLowerCase()
    );
  });

  const totalPipelineValue = userOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const activeOpportunities = userOpportunities.filter(o => o.stage !== 'ganado' && o.stage !== 'perdido');
  const activePipelineValue = activeOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const wonOpportunities = userOpportunities.filter(o => o.stage === 'ganado');
  const wonPipelineValue = wonOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const lostOpportunities = userOpportunities.filter(o => o.stage === 'perdido');

  const filteredOpportunities = userOpportunities.filter(opp => {
    if (oppFilter === 'open') return opp.stage !== 'ganado' && opp.stage !== 'perdido';
    if (oppFilter === 'won') return opp.stage === 'ganado';
    if (oppFilter === 'lost') return opp.stage === 'perdido';
    return true;
  });

  const availableTransferUsers = allUsers.filter(u => u.id !== user.id && u.status !== 'Inactivo');

  // Organizations that would be left without an Owner if `user` is
  // deactivated/deleted — an organization can never be without one, so
  // this gates confirm on both modals below.
  const ownedOrgs = organizations.filter(o => o.ownerId === user.id);
  const ownerHandoffCandidates = allUsers.filter(
    u => u.id !== user.id && u.status !== 'Inactivo' && u.organization === user.organization
  );
  const needsOwnerHandoff = ownedOrgs.length > 0;
  const canConfirmOwnerHandoff = !needsOwnerHandoff || (ownerHandoffCandidates.length > 0 && newOwnerId !== '');

  const handleConfirmDeactivate = () => {
    const targetId = typeof transferTargetUserId === 'number' ? transferTargetUserId : undefined;
    const newOwner = typeof newOwnerId === 'number' ? newOwnerId : undefined;
    onDeactivateUser(user.id, targetId, newOwner);
    setShowDeactivateModal(false);
    onShowToast(`Usuario ${user.name} desactivado`);
  };

  const handleConfirmDelete = () => {
    const targetId = typeof transferTargetUserId === 'number' ? transferTargetUserId : undefined;
    const newOwner = typeof newOwnerId === 'number' ? newOwnerId : undefined;
    onDeleteUser(user.id, targetId, newOwner);
    setShowDeleteModal(false);
    onBack();
    onShowToast(`Usuario ${user.name} eliminado`);
  };

  return (
    <section id="view-user-detail" className="view active">
      {/* Back button */}
      <div className="back-link" onClick={onBack} id="btn-back-users">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Usuarios
      </div>

      {/* Header with Title & Action Button Row */}
      <div
        className="detail-head"
        id="user-detail-header"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div className="detail-title" style={{ flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              initials={user.initials}
              avatarBg={user.avatarBg}
              size="4xl"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 id="user-dt-name" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.625px', color: 'var(--ink-900)', margin: 0 }}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                </h1>
                <span
                  className="badge"
                  style={{
                    background:
                      user.status === 'Activo'
                        ? 'var(--good-bg)'
                        : user.status === 'Invitado'
                        ? 'var(--warn-bg)'
                        : 'var(--canvas)',
                    color:
                      user.status === 'Activo'
                        ? 'var(--good)'
                        : user.status === 'Invitado'
                        ? 'var(--warn)'
                        : 'var(--ink-500)',
                    border: user.status === 'Inactivo' ? '1px solid var(--border)' : 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    borderRadius: '100px',
                    padding: '3px 10px'
                  }}
                >
                  {user.status}
                </span>
                <span
                  className="badge"
                  style={{
                    background: user.role === 'Manager' ? 'var(--warn-bg)' : 'var(--accent-soft)',
                    color: user.role === 'Manager' ? 'var(--orange)' : 'var(--accent)',
                    border: '1px solid transparent',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    borderRadius: '100px',
                    padding: '3px 10px'
                  }}
                >
                  {user.role}
                </span>
              </div>
              {/* Subtitle with position, organization and email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '13.5px', color: 'var(--ink-500)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink-700)' }}>{user.position || 'Asesor Comercial'}</span>
                <span>&middot;</span>
                <span>{user.organization || 'Sin organización'}</span>
                <span>&middot;</span>
                <span>{user.email}</span>
                {user.phone && (
                  <>
                    <span>&middot;</span>
                    <span>{user.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="head-actions" style={{ gap: '10px', alignItems: 'center' }}>
          {/* Primary Action: Edit Profile */}
          <button
            type="button"
            id="btn-edit-user-screen"
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditing(true)}
            style={{ padding: '8px 18px', gap: '7px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Editar perfil
          </button>

          {/* Secondary Actions: Ellipsis Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              id="btn-user-more-actions"
              className="btn btn-secondary btn-sm"
              aria-label="Más acciones de usuario"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              onClick={() => setIsMenuOpen(prev => !prev)}
              style={{
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isMenuOpen ? 'var(--canvas)' : undefined
              }}
              title="Opciones avanzadas"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                id="user-more-actions-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 4px)',
                  width: '210px',
                  background: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '4px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {user.status === 'Inactivo' ? (
                  <button
                    type="button"
                    id="menu-action-reactivate"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onActivateUser) onActivateUser(user.id);
                      else onUpdateUser({ ...user, status: 'Activo' });
                      onShowToast(`Usuario ${user.name} reactivado`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: 'var(--good)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--r-sm)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--good-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Reactivar usuario
                  </button>
                ) : (
                  <button
                    type="button"
                    id="menu-action-deactivate"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setNewOwnerId('');
                      setShowDeactivateModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: 'var(--warn)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--r-sm)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--warn-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    Desactivar usuario
                  </button>
                )}

                <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />

                <button
                  type="button"
                  id="menu-action-delete"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setNewOwnerId('');
                    setShowDeleteModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: 'var(--crit)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--r-sm)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--crit-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Eliminar usuario
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div className="card" style={{ padding: '16px', margin: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Oportunidades Asignadas
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-900)', marginTop: '6px' }}>
            {userOpportunities.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeOpportunities.length} activas</span>
            <span>&middot;</span>
            <span>{wonOpportunities.length} ganadas</span>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', margin: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Pipeline Activo
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-900)', marginTop: '6px' }}>
            {formatMoney(activePipelineValue)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '3px' }}>
            en proceso de negociación
          </div>
        </div>

        <div className="card" style={{ padding: '16px', margin: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Monto Ganado
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--good)', marginTop: '6px' }}>
            {formatMoney(wonPipelineValue)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--good)', marginTop: '3px', fontWeight: 600 }}>
            {wonOpportunities.length} cierres exitosos
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="user-detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tabs Navigation Bar */}
        <div
          className={`user-tab-switch ${activeTab === 'opportunities' ? 'pos-opportunities' : ''}`}
        >
          <div className="user-tab-slider" />

          <button
            type="button"
            id="tab-user-overview"
            onClick={() => setActiveTab('overview')}
            className={`user-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Información y Perfil
          </button>

          <button
            type="button"
            id="tab-user-opps"
            onClick={() => setActiveTab('opportunities')}
            className={`user-tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
          >
            <span>Oportunidades Asignadas</span>
            <span
              style={{
                background: activeTab === 'opportunities' ? 'var(--accent)' : 'var(--border)',
                color: activeTab === 'opportunities' ? 'var(--on-primary)' : 'var(--ink-700)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '100px',
                transition: 'background 0.2s var(--ease), color 0.2s var(--ease)'
              }}
            >
              {userOpportunities.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Información y Perfil */}
        {activeTab === 'overview' && (
          <div className="user-tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" id="card-user-info-fields">
              <div className="card-head">
                <div className="htitle">
                  <h3>Datos generales</h3>
                </div>
              </div>

              <div className="field-list">
                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Correo electrónico</div>
                          <div className="v">{user.email}</div>
                        </div>
                      </div>

                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Teléfono de contacto</div>
                          <div className="v">{user.phone || 'No registrado'}</div>
                        </div>
                      </div>

                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Rol en el equipo</div>
                          <div className="v" style={{ fontWeight: 700, color: user.role === 'Manager' ? 'var(--orange)' : 'var(--accent)' }}>
                            {user.role}
                          </div>
                        </div>
                      </div>

                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Puesto</div>
                          <div className="v">{user.position || 'Asesor Comercial'}</div>
                        </div>
                      </div>

                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Último acceso</div>
                          <div className="v">{user.lastAccess}</div>
                        </div>
                      </div>

                      <div className="field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18" />
                          <path d="M5 21V7l8-4v18" />
                          <path d="M19 21V11l-6-4" />
                        </svg>
                        <div className="ftext">
                          <div className="k">Organización</div>
                          <div className="v">{user.organization || 'Sin organización'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Oportunidades Asignadas */}
              {activeTab === 'opportunities' && (
                <div className="card user-tab-panel" id="card-user-opportunities-list">
                  <div className="card-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    <div className="htitle">
                      <h3>Oportunidades asignadas ({filteredOpportunities.length})</h3>
                    </div>
                    {/* Stage Filter Buttons */}
                    <div className="seg">
                      <button
                        type="button"
                        onClick={() => setOppFilter('all')}
                        className={oppFilter === 'all' ? 'active' : ''}
                      >
                        Todas ({userOpportunities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOppFilter('open')}
                        className={oppFilter === 'open' ? 'active' : ''}
                      >
                        Abiertas ({activeOpportunities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOppFilter('won')}
                        className={oppFilter === 'won' ? 'active' : ''}
                      >
                        Ganadas ({wonOpportunities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOppFilter('lost')}
                        className={oppFilter === 'lost' ? 'active' : ''}
                      >
                        Perdidas ({lostOpportunities.length})
                      </button>
                    </div>
                  </div>

                  {filteredOpportunities.length === 0 ? (
                    <div
                      style={{
                        padding: '36px 20px',
                        textAlign: 'center',
                        color: 'var(--ink-500)',
                        fontSize: '13px',
                        background: 'var(--canvas)',
                        borderRadius: 'var(--r-md)',
                        border: '1px dashed var(--border)'
                      }}
                    >
                      No se encontraron oportunidades en este filtro.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {filteredOpportunities.map(opp => {
                        const associatedContact = contacts.find(c => c.id === opp.contactId);
                        return (
                          <div
                            key={opp.id}
                            id={`user-opp-item-${opp.id}`}
                            onClick={() => onSelectOpportunity(opp.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '13px 16px',
                              background: 'var(--canvas)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink-900)' }}>
                                  {opp.name}
                                </span>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: '10.5px',
                                    padding: '2px 7px',
                                    background:
                                      opp.stage === 'ganado'
                                        ? 'var(--good-bg)'
                                        : opp.stage === 'perdido'
                                        ? 'var(--crit-bg)'
                                        : 'var(--warn-bg)',
                                    color:
                                      opp.stage === 'ganado'
                                        ? 'var(--good)'
                                        : opp.stage === 'perdido'
                                        ? 'var(--crit)'
                                        : 'var(--warn)'
                                  }}
                                >
                                  {STAGE_LABEL[opp.stage as StageKey] || opp.stage}
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{associatedContact?.company || associatedContact?.name || 'Cliente'}</span>
                                <span>&middot;</span>
                                <span>Cierre: {opp.close || 'Sin fecha'}</span>
                              </div>
                            </div>

                            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink-900)', marginLeft: '16px' }}>
                              {formatMoney(opp.value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
      </div>

      <EditUserDrawer
        isOpen={isEditing}
        user={user}
        onClose={() => setIsEditing(false)}
        onSave={onUpdateUser}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: DESACTIVAR USUARIO ================= */}
      <ConfirmDialog
        isOpen={showDeactivateModal}
        id="deactivate-user-screen-overlay"
        tone="warn"
        width="480px"
        title={`¿Desactivar a ${user.name}?`}
        confirmLabel={
          transferTargetUserId && userOpportunities.length > 0
            ? 'Reasignar y desactivar'
            : 'Desactivar usuario'
        }
        confirmDisabled={!canConfirmOwnerHandoff}
        onCancel={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--ink-700)' }}>
              Pierde acceso de inmediato. Su historial se conserva y se puede reactivar después.
            </p>

            {needsOwnerHandoff && ownerHandoffCandidates.length > 0 && (
              <div className="confirm-reassign-box">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span>Esta organización necesita un Owner</span>
                </div>

                <label
                  htmlFor="owner-handoff-deactivate-select"
                  style={{ fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.4 }}
                >
                  Elegí quién lo reemplaza antes de continuar.
                </label>

                <select
                  id="owner-handoff-deactivate-select"
                  value={newOwnerId}
                  onChange={e => setNewOwnerId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Seleccioná un usuario</option>
                  {ownerHandoffCandidates.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.position || 'Sin puesto'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsOwnerHandoff && ownerHandoffCandidates.length === 0 && (
              <div className="confirm-reassign-box neutral">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>No hay a quién transferir el rol</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.5 }}>
                  Esta organización no tiene otro usuario para asumir el rol de Owner. Invitá a alguien
                  más antes de continuar.
                </p>
              </div>
            )}

            {userOpportunities.length > 0 ? (
              <div className="confirm-reassign-box">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span>
                    Reasignar cartera ({userOpportunities.length} oportunidades ·{' '}
                    {formatMoney(totalPipelineValue)})
                  </span>
                </div>

                <label
                  htmlFor="transfer-opps-deactivate-screen-select"
                  style={{ fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.4 }}
                >
                  ¿Quién asume estas cuentas?
                </label>

                <select
                  id="transfer-opps-deactivate-screen-select"
                  value={transferTargetUserId}
                  onChange={e => setTransferTargetUserId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Conservar sin transferir por ahora</option>
                  {availableTransferUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.position || 'Asesor'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--ink-500)', margin: 0 }}>
                No tiene oportunidades activas asignadas.
              </p>
            )}
          </div>
        }
      />

      {/* ================= MODAL: ELIMINAR USUARIO ================= */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        id="delete-user-screen-overlay"
        tone="danger"
        width="480px"
        title={`¿Eliminar a ${user.name}?`}
        confirmLabel={
          transferTargetUserId && userOpportunities.length > 0
            ? 'Reasignar y eliminar'
            : 'Eliminar usuario'
        }
        confirmDisabled={!canConfirmOwnerHandoff}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        body={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--crit)' }}>
              No se puede deshacer: la cuenta se borra del sistema de forma definitiva.
            </p>

            {needsOwnerHandoff && ownerHandoffCandidates.length > 0 && (
              <div className="confirm-reassign-box neutral">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span>Esta organización necesita un Owner</span>
                </div>

                <label
                  htmlFor="owner-handoff-delete-select"
                  style={{ fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.4 }}
                >
                  Elegí quién lo reemplaza antes de continuar.
                </label>

                <select
                  id="owner-handoff-delete-select"
                  value={newOwnerId}
                  onChange={e => setNewOwnerId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Seleccioná un usuario</option>
                  {ownerHandoffCandidates.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.position || 'Sin puesto'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsOwnerHandoff && ownerHandoffCandidates.length === 0 && (
              <div className="confirm-reassign-box neutral">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>No hay a quién transferir el rol</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.5 }}>
                  Esta organización no tiene otro usuario para asumir el rol de Owner. Invitá a alguien
                  más antes de continuar.
                </p>
              </div>
            )}

            {userOpportunities.length > 0 && (
              <div className="confirm-reassign-box neutral">
                <div className="confirm-reassign-head">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span>
                    Reasignar cartera ({userOpportunities.length} oportunidades ·{' '}
                    {formatMoney(totalPipelineValue)})
                  </span>
                </div>

                <label
                  htmlFor="transfer-opps-delete-screen-select"
                  style={{ fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.4 }}
                >
                  ¿Quién asume estas oportunidades?
                </label>

                <select
                  id="transfer-opps-delete-screen-select"
                  value={transferTargetUserId}
                  onChange={e => setTransferTargetUserId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">No transferir</option>
                  {availableTransferUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.position || 'Asesor'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      />
    </section>
  );
};
