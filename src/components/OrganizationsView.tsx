import React, { useState, useMemo } from 'react';
import { Organization, UserMember } from '../types';
import { UserAvatar } from './UserAvatar';
import { RowMenu } from './RowMenu';

interface OrganizationsViewProps {
  organizations: Organization[];
  users: UserMember[];
  onOpenNewOrgModal: () => void;
  onSelectOrganization: (orgId: number) => void;
  onEditOrganization: (orgId: number) => void;
}

type OrgSortField = 'name' | 'owner' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({ organizations, users, onOpenNewOrgModal, onSelectOrganization, onEditOrganization }) => {
  const [sortField, setSortField] = useState<OrgSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getOwner = (org: Organization) => users.find(u => u.id === org.ownerId);

  const handleSort = (field: OrgSortField) => {
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

  const filteredOrgs = useMemo(() => {
    return organizations.filter(o => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const owner = getOwner(o);
      return (
        o.name.toLowerCase().includes(term) ||
        (o.tradeName && o.tradeName.toLowerCase().includes(term)) ||
        (o.taxId && o.taxId.toLowerCase().includes(term)) ||
        (owner && owner.name.toLowerCase().includes(term)) ||
        (owner && owner.email.toLowerCase().includes(term))
      );
    });
  }, [organizations, users, searchTerm]);

  const sortedOrgs = useMemo(() => {
    const list = [...filteredOrgs];
    if (!sortField || !sortDirection) {
      return list;
    }
    list.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'name':
          comp = a.name.localeCompare(b.name, 'es');
          break;
        case 'owner':
          comp = (getOwner(a)?.name || '').localeCompare(getOwner(b)?.name || '', 'es');
          break;
        case 'createdAt':
          comp = a.createdAt.localeCompare(b.createdAt, 'es');
          break;
        default:
          comp = 0;
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
    return list;
  }, [filteredOrgs, sortField, sortDirection, users]);

  return (
    <section id="view-organizations" className="view active">
      <div className="page-head" id="orgs-head">
        <div>
          <h1>Organizaciones</h1>
          <p>Empresas activas en la plataforma WooX &middot; {organizations.length} {organizations.length === 1 ? 'organización' : 'organizaciones'}</p>
        </div>
        <div className="head-actions">
          <button
            id="btn-open-org-modal"
            className="btn btn-primary"
            onClick={onOpenNewOrgModal}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva organización
          </button>
        </div>
      </div>

      <div className="leads-summary-bar" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div className="drawer-input-wrap" style={{ width: '100%', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, RFC, owner..."
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
          {searchTerm && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchTerm('')}
              style={{ fontSize: '11.5px', padding: '4px 8px' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <table id="organizations-table">
        <thead>
          <tr>
            <th
              className={`th-sortable ${sortField === 'name' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('name')}
            >
              <div className="th-sort-inner">
                <span>Organización</span>
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
              className={`th-sortable ${sortField === 'owner' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('owner')}
            >
              <div className="th-sort-inner">
                <span>Owner</span>
                <span className="th-sort-icon">
                  {sortField === 'owner' ? (
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
              className={`th-sortable ${sortField === 'createdAt' ? 'is-sorted' : ''}`}
              onClick={() => handleSort('createdAt')}
            >
              <div className="th-sort-inner">
                <span>Fecha de alta</span>
                <span className="th-sort-icon">
                  {sortField === 'createdAt' ? (
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
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {sortedOrgs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-500)' }}>
                No se encontraron organizaciones con ese criterio de búsqueda.
              </td>
            </tr>
          ) : (
            sortedOrgs.map(o => {
              const owner = getOwner(o);
              return (
                <tr
                  key={o.id}
                  className="user-table-row"
                  onClick={() => onSelectOrganization(o.id)}
                  title={`Ver detalle de ${o.name}`}
                >
                  <td>
                    <div className="name-cell">
                      <div>
                        <span className="lead-name" style={{ display: 'block' }}>{o.name}</span>
                        {o.tradeName && (
                          <span className="lead-sub" style={{ fontSize: '11px', color: 'var(--ink-500)', display: 'block' }}>
                            {o.tradeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {owner ? (
                      <div className="name-cell">
                        <UserAvatar
                          name={owner.name}
                          avatarUrl={owner.avatarUrl}
                          initials={owner.initials}
                          avatarBg={owner.avatarBg}
                          size="sm"
                        />
                        <div>
                          <span className="lead-name" style={{ display: 'block' }}>{owner.name}</span>
                          <span className="lead-sub" style={{ fontSize: '11px', color: 'var(--ink-500)' }}>
                            {owner.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--steel)', fontStyle: 'italic' }}>
                        Owner no encontrado
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--ink-700)' }}>
                      {o.createdAt}
                    </span>
                  </td>
                  <td>
                    <RowMenu
                      ariaLabel={`Opciones de ${o.name}`}
                      actions={[{ label: 'Editar', onClick: () => onEditOrganization(o.id) }]}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
};
