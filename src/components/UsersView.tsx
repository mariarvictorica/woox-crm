import { displayRole } from '../data/initialData';
import React, { useState, useMemo } from 'react';
import { UserMember } from '../types';
import { UserAvatar } from './UserAvatar';

interface UsersViewProps {
  users: UserMember[];
  onInviteUser: () => void;
  onSelectUser?: (user: UserMember) => void;
  onShowToast?: (msg: string) => void;
}

type UserSortField = 'name' | 'email' | 'role' | 'status' | 'lastAccess';
type SortDirection = 'asc' | 'desc' | null;
// Only the roles that exist inside a single organization — the platform-wide
// Super Admin role is never assigned to a member of the Manager's own team.
type RoleFilter = 'all' | 'Manager' | 'Rep';

export const UsersView: React.FC<UsersViewProps> = ({ users, onInviteUser, onSelectUser, onShowToast }) => {
  const [sortField, setSortField] = useState<UserSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const handleSort = (field: UserSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortField(null);
      setSortDirection(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        (u.position && u.position.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term))
      );
    });
  }, [users, searchTerm, roleFilter]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    if (!sortField || !sortDirection) {
      return list;
    }
    list.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'name':
          comp = a.name.localeCompare(b.name, 'es');
          break;
        case 'email':
          comp = a.email.localeCompare(b.email, 'es');
          break;
        case 'role':
          comp = a.role.localeCompare(b.role, 'es');
          break;
        case 'status':
          comp = a.status.localeCompare(b.status, 'es');
          break;
        case 'lastAccess':
          comp = a.lastAccess.localeCompare(b.lastAccess, 'es');
          break;
        default:
          comp = 0;
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
    return list;
  }, [filteredUsers, sortField, sortDirection]);

  return (
    <section id="view-users" className="view active">
      <div className="page-head" id="users-head">
        <div>
          <h1>Usuarios</h1>
          <p>Equipo comercial</p>
        </div>
        <div className="head-actions">
          <button
            id="btn-invite-user"
            className="btn btn-primary"
            onClick={onInviteUser}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Invitar usuario
          </button>
        </div>
      </div>

      {/* Quick Search & Summary bar */}
      <div className="leads-summary-bar" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div className="drawer-input-wrap" style={{ flex: 1, minWidth: '180px', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, correo, puesto..."
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

          <select
            id="users-role-filter"
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
            <option value="Manager">Manager</option>
            <option value="Rep">Representante de Ventas</option>
          </select>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchTerm('')}
              style={{ padding: '4px 8px' }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--ink-500)' }}>
          <span>
            <b>{users.filter(u => u.status === 'Activo').length}</b> activos
          </span>
          <span>&middot;</span>
          <span>
            <b>{users.filter(u => u.status === 'Invitado').length}</b> pendientes
          </span>
        </div>
      </div>

      <table id="users-table">
        <thead>
          <tr>
            <th
              className={`th-sortable ${sortField === 'name' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('name')}
            >
              <div className="th-sort-inner">
                <span>Nombre y puesto</span>
                <span className="th-sort-icon">
                  {sortField === 'name' ? (
                    sortDirection === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    )
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  )}
                </span>
              </div>
            </th>
            <th
              className={`th-sortable ${sortField === 'email' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('email')}
            >
              <div className="th-sort-inner">
                <span>Contacto</span>
                <span className="th-sort-icon">
                  {sortField === 'email' ? (
                    sortDirection === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    )
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  )}
                </span>
              </div>
            </th>
            <th
              className={`th-sortable ${sortField === 'role' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('role')}
            >
              <div className="th-sort-inner">
                <span>Rol</span>
                <span className="th-sort-icon">
                  {sortField === 'role' ? (
                    sortDirection === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    )
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  )}
                </span>
              </div>
            </th>
            <th
              className={`th-sortable ${sortField === 'status' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('status')}
            >
              <div className="th-sort-inner">
                <span>Estado</span>
                <span className="th-sort-icon">
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    )
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  )}
                </span>
              </div>
            </th>
            <th
              className={`th-sortable ${sortField === 'lastAccess' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('lastAccess')}
            >
              <div className="th-sort-inner">
                <span>Último acceso</span>
                <span className="th-sort-icon">
                  {sortField === 'lastAccess' ? (
                    sortDirection === 'asc' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    )
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  )}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-500)' }}>
                No se encontraron usuarios con esos criterios.
              </td>
            </tr>
          ) : (
            sortedUsers.map(u => (
              <tr
                key={u.id}
                onClick={() => onSelectUser && onSelectUser(u)}
                style={{ cursor: onSelectUser ? 'pointer' : 'default' }}
                className="user-table-row"
              >
                <td>
                  <div className="name-cell">
                    <UserAvatar
                      name={u.name}
                      avatarUrl={u.avatarUrl}
                      initials={u.initials}
                      avatarBg={u.avatarBg}
                      size="md"
                    />
                    <div>
                      <span className="lead-name" style={{ display: 'block' }}>{u.name}</span>
                      <span className="lead-sub" style={{ fontSize: '11px', color: 'var(--ink-500)' }}>
                        {u.position || u.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 500 }}>{u.email}</span>
                    {u.phone && (
                      <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>
                        {u.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: u.role === 'Super Admin (SA)' ? 'var(--accent)' : u.role === 'Manager' ? 'var(--orange)' : 'var(--ink-800)'
                    }}
                  >
                    {displayRole(u.role)}
                  </span>
                </td>
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
                      Inactivo
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: u.status === 'Invitado' ? 'var(--ink-500)' : 'var(--ink-700)' }}>
                    {u.lastAccess}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};
