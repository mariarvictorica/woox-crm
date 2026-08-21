import React, { useState } from 'react';
import { Organization, UserMember } from '../types';
import { UserAvatar } from './UserAvatar';
import { EditUserDrawer } from './EditUserDrawer';
import { OwnerHandoffConfirmDialog } from './OwnerHandoffConfirmDialog';
import { RowMenu } from './RowMenu';

interface OrgUserDetailViewProps {
  organization: Organization | undefined;
  user: UserMember | undefined;
  tenantUsers: UserMember[];
  onBack: () => void;
  onUpdateUser: (updatedUser: UserMember) => void;
  onSuspendUser: (userId: number, newOwnerId?: number) => void;
  onActivateUser: (userId: number) => void;
  onDeleteUser: (userId: number, newOwnerId?: number) => void;
  onShowToast: (msg: string) => void;
}

const displayRole = (role: string) => (role === 'Manager' ? 'Org Manager' : role);

/**
 * Super Admin's view of a single user inside one organization.
 *
 * There's no existing Super-Admin-scoped equivalent to reuse wholesale: the
 * Manager panel's own UserDetailView is built around Manager-only concepts
 * (assigned-opportunity pipeline stats, rep-scoped actions) that don't apply
 * to a cross-tenant governance view. This composes the same atomic pieces
 * used everywhere else instead — UserAvatar, the card/field-list classes
 * from the organization ficha, the back-link convention, the shared RowMenu
 * for actions, and OwnerHandoffConfirmDialog/EditUserDrawer for edit and
 * suspend/delete.
 */
export const OrgUserDetailView: React.FC<OrgUserDetailViewProps> = ({
  organization,
  user,
  tenantUsers,
  onBack,
  onUpdateUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onShowToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);

  if (!organization || !user) {
    return (
      <section id="view-org-user-detail" className="view active">
        <div
          className="card"
          style={{ maxWidth: '480px', margin: '48px auto', textAlign: 'center', padding: '36px 28px' }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
            No encontramos este usuario
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginBottom: '20px' }}>
            Puede que haya sido eliminado, o la organización ya no existe.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Volver a Usuarios
          </button>
        </div>
      </section>
    );
  }

  const isOwner = user.id === organization.ownerId;
  const candidates = tenantUsers.filter(u => u.id !== user.id && u.status !== 'Inactivo');

  const handleConfirm = (newOwnerId?: number) => {
    if (confirmAction === 'suspend') {
      onSuspendUser(user.id, newOwnerId);
      onShowToast(`Usuario ${user.name} suspendido`);
    } else if (confirmAction === 'delete') {
      onDeleteUser(user.id, newOwnerId);
      onShowToast(`Usuario ${user.name} eliminado`);
      onBack();
    }
    setConfirmAction(null);
  };

  return (
    <section id="view-org-user-detail" className="view active">
      <div className="back-link" onClick={onBack} id="btn-back-org-users">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Usuarios de {organization.name}
      </div>

      <div
        className="detail-head"
        id="org-user-detail-header"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          initials={user.initials}
          avatarBg={user.avatarBg}
          size="xl"
        />

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-900)', margin: 0 }}>
              {user.name}
            </h1>
            {isOwner && (
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '10px' }}>
                Owner
              </span>
            )}
            {user.status === 'Activo' && (
              <span className="badge" style={{ background: 'var(--good-bg)', color: 'var(--good)' }}>Activo</span>
            )}
            {user.status === 'Invitado' && (
              <span className="badge" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>Invitado</span>
            )}
            {user.status === 'Inactivo' && (
              <span className="badge" style={{ background: 'var(--canvas)', color: 'var(--ink-500)', border: '1px solid var(--border)' }}>
                Suspendido
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '4px' }}>
            {user.position || displayRole(user.role)} &middot; {organization.name}
          </p>
        </div>

        <RowMenu
          ariaLabel={`Acciones de ${user.name}`}
          actions={[
            { label: 'Editar', onClick: () => setIsEditing(true) },
            user.status === 'Inactivo'
              ? {
                  label: 'Reactivar',
                  onClick: () => {
                    onActivateUser(user.id);
                    onShowToast(`Usuario ${user.name} reactivado`);
                  }
                }
              : { label: 'Suspender…', onClick: () => setConfirmAction('suspend') },
            { label: 'Eliminar…', onClick: () => setConfirmAction('delete'), tone: 'danger' }
          ]}
        />
      </div>

      <div className="card" id="card-org-user-fields">
        <div className="card-head">
          <div className="htitle">
            <h3>Información</h3>
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
              <div className="k">Teléfono</div>
              <div className={`v ${user.phone ? '' : 'empty'}`}>{user.phone || 'Sin teléfono registrado'}</div>
            </div>
          </div>

          <div className="field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="ftext">
              <div className="k">Rol en el equipo</div>
              <div className="v">{displayRole(user.role)}</div>
            </div>
          </div>

          <div className="field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M9 7h6M9 11h6M9 15h6" />
            </svg>
            <div className="ftext">
              <div className="k">Organización</div>
              <div className="v">{organization.name}</div>
            </div>
          </div>
        </div>
      </div>

      <EditUserDrawer
        isOpen={isEditing}
        user={user}
        onClose={() => setIsEditing(false)}
        onSave={onUpdateUser}
        onShowToast={onShowToast}
      />

      <OwnerHandoffConfirmDialog
        isOpen={confirmAction === 'suspend'}
        tone="warn"
        confirmLabel="Suspender usuario"
        consequenceCopy="Pierde acceso de inmediato. Su historial se conserva y se puede reactivar después."
        targetUser={user}
        isOwner={isOwner}
        candidates={candidates}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />

      <OwnerHandoffConfirmDialog
        isOpen={confirmAction === 'delete'}
        tone="danger"
        confirmLabel="Eliminar usuario"
        consequenceCopy="No se puede deshacer: la cuenta se borra del sistema de forma definitiva."
        targetUser={user}
        isOwner={isOwner}
        candidates={candidates}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </section>
  );
};
