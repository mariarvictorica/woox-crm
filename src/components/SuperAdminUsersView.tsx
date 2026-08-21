import React, { useMemo, useState } from 'react';
import { Organization, UserMember } from '../types';
import { UsersTable } from './UsersTable';
import { SearchableSelect } from './SearchableSelect';

interface SuperAdminUsersViewProps {
  users: UserMember[];
  organizations: Organization[];
  onSelectUser: (userId: number) => void;
  /** Opens the shared user form with the "link to an organization" step. */
  onAddUser: () => void;
  onUpdateUser: (updatedUser: UserMember) => void;
  onSuspendUser: (userId: number, newOwnerId?: number) => void;
  onActivateUser: (userId: number) => void;
  onDeleteUser: (userId: number, newOwnerId?: number) => void;
  onShowToast: (msg: string) => void;
}

type StatusFilter = 'all' | 'Activo' | 'Invitado' | 'Inactivo';
type RoleFilter = 'all' | 'Manager' | 'Rep' | 'Super Admin (SA)';

const displayRole = (role: string) => (role === 'Manager' ? 'Manager' : role);

/**
 * Cross-organization "Usuarios" tab: every user on the platform, so the
 * Super Admin can find someone without first knowing which organization
 * they belong to. Filtering happens here; the table itself (rows, actions,
 * edit drawer, suspend/delete + Owner handoff) is the exact same
 * UsersTable the organization-scoped Usuarios tab uses.
 */
export const SuperAdminUsersView: React.FC<SuperAdminUsersViewProps> = ({
  users,
  organizations,
  onSelectUser,
  onAddUser,
  onUpdateUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [orgFilter, setOrgFilter] = useState('');

  const orgOptions = useMemo(
    () => organizations.map(o => ({ value: o.name, label: o.name })).sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [organizations]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter(u => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (orgFilter && u.organization !== orgFilter) return false;
      if (term && !(u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [users, searchTerm, statusFilter, roleFilter, orgFilter]);

  const countByStatus = (status: StatusFilter) =>
    status === 'all' ? users.length : users.filter(u => u.status === status).length;

  return (
    <section id="view-superadmin-users" className="view active">
      <div className="page-head" id="superadmin-users-head">
        <div>
          <h1>Usuarios</h1>
          <p>Todos los usuarios de la plataforma, en todas las organizaciones &middot; {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}</p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            id="btn-add-platform-user"
            className="btn btn-primary"
            onClick={onAddUser}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Agregar usuario
          </button>
        </div>
      </div>

      <div className="leads-summary-bar" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div className="drawer-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--canvas)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '7px 10px 7px 30px',
                fontSize: '12.5px',
                width: '100%'
              }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: 'absolute', left: '10px', color: 'var(--ink-500)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div style={{ flexShrink: 0 }}>
          <SearchableSelect
            options={orgOptions}
            value={orgFilter}
            onChange={setOrgFilter}
            allLabel="Todas las organizaciones"
            ariaLabel="Filtrar por organización"
          />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as RoleFilter)}
            aria-label="Filtrar por rol"
            style={{
              flexShrink: 0,
              background: 'var(--canvas)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              padding: '7px 10px',
              fontSize: '12.5px',
              color: 'var(--ink-700)'
            }}
          >
            <option value="all">Todos los roles</option>
            <option value="Manager">{displayRole('Manager')}</option>
            <option value="Rep">Rep</option>
            <option value="Super Admin (SA)">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            style={{
              flexShrink: 0,
              background: 'var(--canvas)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              padding: '7px 10px',
              fontSize: '12.5px',
              color: 'var(--ink-700)'
            }}
          >
            <option value="all">Todos los estados ({countByStatus('all')})</option>
            <option value="Activo">Activos ({countByStatus('Activo')})</option>
            <option value="Invitado">Invitados ({countByStatus('Invitado')})</option>
            <option value="Inactivo">Suspendidos ({countByStatus('Inactivo')})</option>
          </select>
        </div>
      </div>

      <UsersTable
        users={filteredUsers}
        allUsers={users}
        organizations={organizations}
        showOrgColumn
        onSelectUser={onSelectUser}
        onUpdateUser={onUpdateUser}
        onSuspendUser={onSuspendUser}
        onActivateUser={onActivateUser}
        onDeleteUser={onDeleteUser}
        onShowToast={onShowToast}
        emptyMessage="No se encontraron usuarios con esos filtros."
      />
    </section>
  );
};
