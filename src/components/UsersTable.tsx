import { displayRole } from '../data/initialData';
import React, { useMemo, useState } from 'react';
import { Organization, UserMember } from '../types';
import { UserAvatar } from './UserAvatar';
import { RowMenu } from './RowMenu';
import { EditUserDrawer } from './EditUserDrawer';
import { OwnerHandoffConfirmDialog } from './OwnerHandoffConfirmDialog';

interface UsersTableProps {
  /** Rows to display — a single organization's roster, or a filtered slice
   *  of every user in the platform. */
  users: UserMember[];
  /** The full, unfiltered user pool. Owner-handoff replacement candidates
   *  are always resolved from here (scoped to the target's own
   *  organization), never from `users` — a filtered/global view of `users`
   *  must never leak users from other organizations into that picker. */
  allUsers: UserMember[];
  /** Every organization these rows could belong to, used to resolve each
   *  row's Owner badge and (when shown) its organization name. */
  organizations: Organization[];
  /** Show the Organización column — off inside a single org's own Usuarios
   *  tab (redundant there), on in the cross-organization Super Admin list. */
  showOrgColumn: boolean;
  onSelectUser: (userId: number) => void;
  onUpdateUser: (updatedUser: UserMember) => void;
  onSuspendUser: (userId: number, newOwnerId?: number) => void;
  onActivateUser: (userId: number) => void;
  onDeleteUser: (userId: number, newOwnerId?: number) => void;
  onShowToast: (msg: string) => void;
  /** Shown under the table when `users` is empty. */
  emptyMessage?: string;
}

/**
 * The single users table — every row, action menu, edit drawer, and
 * suspend/delete confirmation, shared by the organization-scoped Usuarios
 * tab and the cross-organization Super Admin Usuarios tab. Extracted so
 * "suspend a user" can't quietly behave differently depending on which of
 * those two screens triggered it.
 */
export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  allUsers,
  organizations,
  showOrgColumn,
  onSelectUser,
  onUpdateUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onShowToast,
  emptyMessage = 'No hay usuarios para mostrar.'
}) => {
  const [editingUser, setEditingUser] = useState<UserMember | null>(null);
  const [confirmActionUser, setConfirmActionUser] = useState<{ user: UserMember; action: 'suspend' | 'delete' } | null>(
    null
  );

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.name.localeCompare(b.name, 'es')), [users]);

  const orgOf = (u: UserMember) => organizations.find(o => o.name === u.organization);
  const isOwner = (u: UserMember) => orgOf(u)?.ownerId === u.id;
  const candidatesFor = (u: UserMember) =>
    allUsers.filter(other => other.organization === u.organization && other.id !== u.id && other.status !== 'Inactivo');

  return (
    <>
      <table id="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            {showOrgColumn && <th>Organización</th>}
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map(u => (
            <tr key={u.id} className="user-table-row" onClick={() => onSelectUser(u.id)} title={`Ver detalle de ${u.name}`}>
              <td>
                <div className="name-cell">
                  <UserAvatar name={u.name} avatarUrl={u.avatarUrl} initials={u.initials} avatarBg={u.avatarBg} size="md" />
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="lead-name">{u.name}</span>
                      {isOwner(u) && (
                        <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '10px' }}>
                          Owner
                        </span>
                      )}
                    </span>
                    <span className="lead-sub" style={{ fontSize: '11px', color: 'var(--ink-500)' }}>
                      {u.email}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: u.role === 'Super Admin (SA)' ? 'var(--accent)' : u.role === 'Manager' ? 'var(--orange)' : 'var(--ink-800)'
                  }}
                >
                  {displayRole(u.role)}
                </span>
              </td>
              {showOrgColumn && (
                <td>
                  <span style={{ fontSize: '12.5px', color: 'var(--ink-700)' }}>{u.organization || 'Sin organización'}</span>
                </td>
              )}
              <td>
                {u.status === 'Activo' && (
                  <span className="badge" style={{ background: 'var(--good-bg)', color: 'var(--good)' }}>
                    Activo
                  </span>
                )}
                {u.status === 'Invitado' && (
                  <span className="badge" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                    Invitado
                  </span>
                )}
                {u.status === 'Inactivo' && (
                  <span className="badge badge-neutral">
                    Suspendido
                  </span>
                )}
              </td>
              <td>
                <RowMenu
                  ariaLabel={`Opciones de ${u.name}`}
                  actions={[
                    { label: 'Editar', onClick: () => setEditingUser(u) },
                    u.status === 'Inactivo'
                      ? {
                          label: 'Reactivar',
                          onClick: () => {
                            onActivateUser(u.id);
                            onShowToast(`Usuario ${u.name} reactivado`);
                          }
                        }
                      : { label: 'Suspender…', onClick: () => setConfirmActionUser({ user: u, action: 'suspend' }) },
                    {
                      label: 'Eliminar…',
                      onClick: () => setConfirmActionUser({ user: u, action: 'delete' }),
                      tone: 'danger'
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedUsers.length === 0 && (
        <p style={{ fontSize: '12.5px', color: 'var(--ink-500)', padding: '14px 4px 4px' }}>{emptyMessage}</p>
      )}

      {editingUser && (
        <EditUserDrawer
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={onUpdateUser}
          onShowToast={onShowToast}
        />
      )}

      {confirmActionUser && (
        <OwnerHandoffConfirmDialog
          isOpen={confirmActionUser.action === 'suspend'}
          tone="warn"
          confirmLabel="Suspender usuario"
          consequenceCopy="Pierde acceso de inmediato. Su historial se conserva y se puede reactivar después."
          targetUser={confirmActionUser.user}
          isOwner={isOwner(confirmActionUser.user)}
          candidates={candidatesFor(confirmActionUser.user)}
          onCancel={() => setConfirmActionUser(null)}
          onConfirm={newOwnerId => {
            onSuspendUser(confirmActionUser.user.id, newOwnerId);
            onShowToast(`Usuario ${confirmActionUser.user.name} suspendido`);
            setConfirmActionUser(null);
          }}
        />
      )}

      {confirmActionUser && (
        <OwnerHandoffConfirmDialog
          isOpen={confirmActionUser.action === 'delete'}
          tone="danger"
          confirmLabel="Eliminar usuario"
          consequenceCopy="No se puede deshacer: la cuenta se borra del sistema de forma definitiva."
          targetUser={confirmActionUser.user}
          isOwner={isOwner(confirmActionUser.user)}
          candidates={candidatesFor(confirmActionUser.user)}
          onCancel={() => setConfirmActionUser(null)}
          onConfirm={newOwnerId => {
            onDeleteUser(confirmActionUser.user.id, newOwnerId);
            onShowToast(`Usuario ${confirmActionUser.user.name} eliminado`);
            setConfirmActionUser(null);
          }}
        />
      )}
    </>
  );
};
