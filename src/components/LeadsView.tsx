import React, { useState, useMemo, useEffect } from 'react';
import { Contact, Opportunity, LeadSortOption, LeadFilterState } from '../types';

interface LeadsViewProps {
  contacts: Contact[];
  opportunities: Opportunity[];
  initialFilters?: Partial<LeadFilterState> | null;
  onSelectLead: (leadId: number) => void;
  onSelectOpportunity?: (oppId: number) => void;
  onOpenLeadModal: () => void;
  onOpenNewOppModal?: (contactId: number) => void;
  onToggleHot?: (leadId: number) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_FILTERS: LeadFilterState = {
  source: 'all',
  industry: 'all',
  activity: 'all',
  opportunity: 'all',
  priority: 'all'
};

export type LeadSortField = 'name' | 'source' | 'opps' | 'activity' | 'recent';
export type SortDirection = 'asc' | 'desc' | null;

export const getOriginDisplayName = (src?: string, srcLabel?: string): string => {
  if (src === 'b2b' || srcLabel === 'B2B') return 'B2B';
  if (src === 'online' || srcLabel === 'ONL' || srcLabel === 'Online' || src === 'ig' || src === 'wa' || src === 'fb' || src === 'tt') return 'Online';
  return 'Retail';
};

export const getOriginBadgeClass = (src?: string, srcLabel?: string): string => {
  const name = getOriginDisplayName(src, srcLabel);
  return name.toLowerCase();
};

export const LeadsView: React.FC<LeadsViewProps> = ({
  contacts,
  opportunities,
  initialFilters,
  onSelectLead,
  onSelectOpportunity,
  onOpenLeadModal,
  onOpenNewOppModal,
  onToggleHot,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LeadFilterState>(() => {
    return initialFilters ? { ...DEFAULT_FILTERS, ...initialFilters } : DEFAULT_FILTERS;
  });
  const [tempFilters, setTempFilters] = useState<LeadFilterState>(() => {
    return initialFilters ? { ...DEFAULT_FILTERS, ...initialFilters } : DEFAULT_FILTERS;
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortField, setSortField] = useState<LeadSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Sync filters whenever initialFilters prop changes (e.g. from Dashboard click)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
      setTempFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  // Toggle sorting by column with 3 states: Default/Desc -> Asc -> Neutral (null)
  const handleSortColumn = (field: LeadSortField) => {
    const isOppsOrRecent = field === 'opps' || field === 'recent';
    const firstDir: SortDirection = isOppsOrRecent ? 'desc' : 'asc';
    const secondDir: SortDirection = isOppsOrRecent ? 'asc' : 'desc';

    if (sortField !== field) {
      setSortField(field);
      setSortDirection(firstDir);
      onShowToast(`Ordenado por ${getFieldLabel(field)} (${firstDir === 'desc' ? 'descendente' : 'ascendente'})`);
    } else if (sortDirection === firstDir) {
      setSortDirection(secondDir);
      onShowToast(`Ordenado por ${getFieldLabel(field)} (${secondDir === 'desc' ? 'descendente' : 'ascendente'})`);
    } else if (sortDirection === secondDir) {
      // 3rd click: Reset to neutral
      setSortField(null);
      setSortDirection(null);
      onShowToast(`Orden neutral restaurado para ${getFieldLabel(field)}`);
    } else {
      setSortField(field);
      setSortDirection(firstDir);
      onShowToast(`Ordenado por ${getFieldLabel(field)}`);
    }
  };

  const getFieldLabel = (field: LeadSortField): string => {
    switch (field) {
      case 'name': return 'Nombre';
      case 'source': return 'Origen';
      case 'opps': return 'Oportunidades';
      case 'activity': return 'Última actividad';
      case 'recent': return 'Recién agregados';
      default: return field;
    }
  };

  // Compute opportunities map for fast lookup
  const oppsByContact = useMemo(() => {
    const map = new Map<number, Opportunity[]>();
    opportunities.forEach(opp => {
      const list = map.get(opp.contactId) || [];
      list.push(opp);
      map.set(opp.contactId, list);
    });
    return map;
  }, [opportunities]);

  // Overall metrics for header summary
  const totalCount = contacts.length;
  const hotCount = contacts.filter(c => c.hot).length;
  const withoutOppCount = useMemo(() => {
    return contacts.filter(c => {
      const contactOpps = oppsByContact.get(c.id) || [];
      const openOpps = contactOpps.filter(o => ['nuevo', 'contactado', 'calificado', 'negociacion'].includes(o.stage));
      return openOpps.length === 0;
    }).length;
  }, [contacts, oppsByContact]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.source !== 'all') count++;
    if (filters.industry !== 'all') count++;
    if (filters.activity !== 'all') count++;
    if (filters.opportunity !== 'all') count++;
    if (filters.priority && filters.priority !== 'all') count++;
    return count;
  }, [filters]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const hay = `${c.name} ${c.company || ''} ${c.phone || ''} ${c.email || ''} ${c.region || ''} ${c.giro || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      // Priority
      if (filters.priority && filters.priority !== 'all') {
        if (filters.priority === 'hot' && !c.hot) return false;
        if (filters.priority === 'normal' && c.hot) return false;
      }

      // Source
      if (filters.source !== 'all') {
        const originVal = getOriginBadgeClass(c.src, c.srcLabel);
        if (originVal !== filters.source.toLowerCase()) {
          return false;
        }
      }

      // Industry
      if (filters.industry !== 'all' && c.giro !== filters.industry) {
        return false;
      }

      // Activity
      if (filters.activity !== 'all') {
        const days = c.daysInactive ?? 0;
        if (filters.activity === 'today' && days > 0) return false;
        if (filters.activity === '7days' && days > 7) return false;
        if (filters.activity === '30days' && days > 30) return false;
      }

      // Opportunity
      if (filters.opportunity !== 'all') {
        const contactOpps = oppsByContact.get(c.id) || [];
        const openOpps = contactOpps.filter(o => ['nuevo', 'contactado', 'calificado', 'negociacion'].includes(o.stage));
        if (filters.opportunity === 'with_opp' && openOpps.length === 0) return false;
        if (filters.opportunity === 'without_opp' && openOpps.length > 0) return false;
      }

      return true;
    });
  }, [contacts, searchTerm, filters, oppsByContact]);

  // Sorted contacts
  const sortedContacts = useMemo(() => {
    const list = [...filteredContacts];
    if (!sortField || !sortDirection) {
      return list; // Neutral order
    }

    list.sort((a, b) => {
      let comparison = 0;
      const oppsA = oppsByContact.get(a.id) || [];
      const oppsB = oppsByContact.get(b.id) || [];
      const openValA = oppsA.filter(o => o.stage !== 'perdido').reduce((s, o) => s + (o.value || 0), 0);
      const openValB = oppsB.filter(o => o.stage !== 'perdido').reduce((s, o) => s + (o.value || 0), 0);

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
          break;
        case 'source':
          comparison = getOriginDisplayName(a.src, a.srcLabel).localeCompare(getOriginDisplayName(b.src, b.srcLabel), 'es');
          break;
        case 'opps':
          if (openValA !== openValB) {
            comparison = openValA - openValB;
          } else {
            comparison = oppsA.length - oppsB.length;
          }
          break;
        case 'activity':
          comparison = (a.daysInactive ?? 0) - (b.daysInactive ?? 0);
          break;
        case 'recent':
          comparison = a.id - b.id;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredContacts, sortField, sortDirection, oppsByContact]);

  const handleOpenFilterDrawer = () => {
    setTempFilters({ ...filters });
    setIsFilterDrawerOpen(true);
  };

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterDrawerOpen(false);
    onShowToast('Filtros aplicados');
  };

  const handleResetFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setIsFilterDrawerOpen(false);
    onShowToast('Filtros restablecidos');
  };

  return (
    <section id="view-leads" className="view active">
      {/* Page Header */}
      <div className="page-head" id="leads-head">
        <div>
          <h1>Contactos</h1>
          <p>Priorización y seguimiento de contactos comerciales</p>
        </div>
        <div className="head-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="btn-open-lead-modal"
            className="btn btn-primary"
            onClick={onOpenLeadModal}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo contacto
          </button>
        </div>
      </div>

      {/* Summary Bar with Quick Filter Tabs */}
      <div className="leads-summary-bar" id="leads-summary-header">
        <div className="leads-segmented-filters" id="leads-quick-filter-tabs">
          <button
            type="button"
            id="tab-filter-all"
            className={`leads-tab-btn ${filters.priority !== 'hot' && filters.opportunity !== 'without_opp' ? 'active' : ''}`}
            onClick={() => {
              setFilters(prev => ({ ...prev, priority: 'all', activity: 'all', opportunity: 'all' }));
            }}
          >
            <span>Todos</span>
            <span className="tab-badge">{totalCount}</span>
          </button>

          <button
            type="button"
            id="tab-filter-priority"
            className={`leads-tab-btn ${filters.priority === 'hot' ? 'active' : ''}`}
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                priority: prev.priority === 'hot' ? 'all' : 'hot',
                activity: 'all',
                opportunity: 'all'
              }));
            }}
          >
            <span className="tab-dot dot-hot"></span>
            <span>Prioritarios</span>
            <span className="tab-badge">{hotCount}</span>
          </button>

          <button
            type="button"
            id="tab-filter-without-opp"
            className={`leads-tab-btn ${filters.opportunity === 'without_opp' ? 'active' : ''}`}
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                opportunity: prev.opportunity === 'without_opp' ? 'all' : 'without_opp',
                priority: 'all',
                activity: 'all'
              }));
            }}
          >
            <span className="tab-dot" style={{ background: 'var(--warn-bright)' }}></span>
            <span>Sin oportunidad activa</span>
            <span className="tab-badge" style={{ background: filters.opportunity === 'without_opp' ? 'var(--warn-soft)' : undefined, color: filters.opportunity === 'without_opp' ? 'var(--warn-ink)' : undefined }}>{withoutOppCount}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Notification for without_opp */}
      {filters.opportunity === 'without_opp' && (
        <div
          id="leads-filter-alert-no-opp"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--warn-surface)',
            border: '1px solid var(--warn-soft-strong)',
            borderRadius: '8px',
            padding: '9px 14px',
            marginBottom: '14px',
            fontSize: '13px',
            color: 'var(--warn-ink)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Filtro activo desde el Dashboard: <strong>Sin oportunidad activa ({filteredContacts.length} contactos)</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--warn-deep)', padding: '2px 8px', height: '26px', fontSize: '12px', background: 'var(--warn-soft)', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            onClick={() => setFilters(prev => ({ ...prev, opportunity: 'all' }))}
          >
            Quitar filtro
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="filter-bar" id="leads-filter-bar">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.6" y2="16.6" />
          </svg>
          <input
            id="leads-search-input"
            type="text"
            placeholder="Buscar por nombre, empresa, teléfono o correo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-300)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700
              }}
              title="Borrar búsqueda"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filters drawer trigger */}
        <button
          id="btn-open-filters"
          className={`btn btn-ghost ${activeFiltersCount > 0 ? 'btn-primary' : ''}`}
          onClick={handleOpenFilterDrawer}
          style={{ position: 'relative' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
        </button>

        {activeFiltersCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            style={{ color: 'var(--ink-500)', fontSize: '12px' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Main Leads Table */}
      {contacts.length === 0 ? (
        // Empty State: Sin contactos en el sistema
        <div className="empty-state-box" id="empty-state-no-leads">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="empty-state-title">Aún no hay contactos</div>
          <div className="empty-state-desc">
            Registra tu primer contacto para comenzar a gestionar contactos comerciales y oportunidades.
          </div>
          <button className="btn btn-primary" onClick={onOpenLeadModal}>
            Crear contacto
          </button>
        </div>
      ) : sortedContacts.length === 0 ? (
        // Empty State: Sin resultados de búsqueda o filtros
        <div className="empty-state-box" id="empty-state-filtered">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {searchTerm ? (
            <>
              <div className="empty-state-title">No hay contactos que coincidan con la búsqueda</div>
              <div className="empty-state-desc">
                No encontramos ningún contacto que coincida con &ldquo;{searchTerm}&rdquo;.
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <div className="empty-state-title">No hay contactos con estos filtros</div>
              <div className="empty-state-desc">
                Intenta ajustando los filtros de origen, giro o actividad.
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <table id="leads-table">
          <thead>
            <tr>
              {/* Columna Contacto */}
              <th
                id="th-sort-lead"
                className={`th-sortable ${sortField === 'name' ? 'is-sorted' : ''}`}
                onClick={() => handleSortColumn('name')}
                title={`Ordenar por nombre (${sortField === 'name' && sortDirection === 'asc' ? 'Z a A' : 'A a Z'})`}
              >
                <div className="th-sort-inner">
                  <span>Contacto</span>
                  <span className="th-sort-icon">
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35">
                        <path d="m7 15 5 5 5-5" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </span>
                </div>
              </th>

              {/* Columna Origen */}
              <th
                id="th-sort-source"
                className={`th-sortable ${sortField === 'source' ? 'is-sorted' : ''}`}
                onClick={() => handleSortColumn('source')}
                title={`Ordenar por origen (${sortField === 'source' && sortDirection === 'asc' ? 'Z a A' : 'A a Z'})`}
              >
                <div className="th-sort-inner">
                  <span>Origen</span>
                  <span className="th-sort-icon">
                    {sortField === 'source' ? (
                      sortDirection === 'asc' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35">
                        <path d="m7 15 5 5 5-5" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </span>
                </div>
              </th>

              {/* Columna Oportunidades */}
              <th
                id="th-sort-opps"
                className={`th-sortable ${sortField === 'opps' ? 'is-sorted' : ''}`}
                onClick={() => handleSortColumn('opps')}
                title={`Ordenar por oportunidades (${sortField === 'opps' && sortDirection === 'desc' ? 'menor a mayor valor' : 'mayor a menor valor'})`}
              >
                <div className="th-sort-inner">
                  <span>Oportunidades</span>
                  <span className="th-sort-icon">
                    {sortField === 'opps' ? (
                      sortDirection === 'asc' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35">
                        <path d="m7 15 5 5 5-5" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </span>
                </div>
              </th>

              {/* Columna Última actividad */}
              <th
                id="th-sort-activity"
                className={`th-sortable ${sortField === 'activity' ? 'is-sorted' : ''}`}
                onClick={() => handleSortColumn('activity')}
                title={`Ordenar por actividad (${sortField === 'activity' && sortDirection === 'asc' ? 'más antigua a más reciente' : 'más reciente a más antigua'})`}
              >
                <div className="th-sort-inner">
                  <span>Última actividad</span>
                  <span className="th-sort-icon">
                    {sortField === 'activity' ? (
                      sortDirection === 'asc' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35">
                        <path d="m7 15 5 5 5-5" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody id="leads-tbody">
            {sortedContacts.map(c => {
              const contactOpps = oppsByContact.get(c.id) || [];
              const openOpps = contactOpps.filter(o => ['nuevo', 'contactado', 'calificado', 'negociacion'].includes(o.stage));

              return (
                <tr
                  key={c.id}
                  id={`lead-row-${c.id}`}
                  className="lead-row"
                  onClick={() => onSelectLead(c.id)}
                >
                  {/* Lead (Nombre + Empresa) */}
                  <td>
                    <div className="name-cell">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="lead-name">{c.name}</span>
                          {c.hot && (
                            <span
                              className="lead-hot-tag"
                              title="Contacto prioritario"
                            >
                              Prioritario
                            </span>
                          )}
                        </div>
                        {c.company && (
                          <div className="lead-sub" style={{ marginTop: '1px' }}>
                            {c.company} {c.giro ? `· ${c.giro}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Source / Origen */}
                  <td>
                    <span
                      className={`origin-badge origin-badge-${getOriginBadgeClass(c.src, c.srcLabel)}`}
                      title={`Origen: ${getOriginDisplayName(c.src, c.srcLabel)}`}
                    >
                      {getOriginDisplayName(c.src, c.srcLabel)}
                    </span>
                  </td>

                  {/* Opportunities */}
                  <td onClick={e => e.stopPropagation()}>
                    {contactOpps.length > 0 ? (
                      <button
                        className="opps-cell-btn"
                        id={`opps-btn-lead-${c.id}`}
                        onClick={() => {
                          if (contactOpps.length === 1 && onSelectOpportunity) {
                            onSelectOpportunity(contactOpps[0].id);
                          } else {
                            onSelectLead(c.id);
                          }
                        }}
                        title="Ver oportunidades asociadas"
                      >
                        <span>
                          {openOpps.length} {openOpps.length === 1 ? 'abierta' : 'abiertas'}
                        </span>
                      </button>
                    ) : (
                      <span className="opps-cell-btn empty">Sin oportunidades</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td>
                    <div className="activity-cell">
                      <span className="activity-time">{c.last || 'Reciente'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Filters Drawer / Slide-Over Modal */}
      {isFilterDrawerOpen && (
        <div
          className="filter-drawer-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setIsFilterDrawerOpen(false);
          }}
        >
          <div className="filter-drawer" id="leads-filter-drawer">
            <div className="filter-drawer-header">
              <h3>Filtros de Contactos</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--ink-500)',
                  fontSize: '18px',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            <div className="filter-drawer-body">
              {/* Priority */}
              <div className="filter-group">
                <label>Prioridad</label>
                <select
                  id="filter-select-priority"
                  value={tempFilters.priority || 'all'}
                  onChange={e => setTempFilters({ ...tempFilters, priority: e.target.value })}
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="hot">★ Solo prioritarios</option>
                  <option value="normal">Estándar (No prioritarios)</option>
                </select>
              </div>

              {/* Source */}
              <div className="filter-group">
                <label>Origen / Canal de captación</label>
                <select
                  id="filter-select-source"
                  value={tempFilters.source}
                  onChange={e => setTempFilters({ ...tempFilters, source: e.target.value })}
                >
                  <option value="all">Todos los orígenes</option>
                  <option value="retail">Retail</option>
                  <option value="b2b">B2B</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Industry */}
              <div className="filter-group">
                <label>Giro / Industria</label>
                <select
                  id="filter-select-industry"
                  value={tempFilters.industry}
                  onChange={e => setTempFilters({ ...tempFilters, industry: e.target.value })}
                >
                  <option value="all">Todos los giros</option>
                  <option value="Hotelería">Hotelería</option>
                  <option value="Construcción">Construcción</option>
                  <option value="Arquitectura">Arquitectura</option>
                  <option value="Retail">Retail</option>
                  <option value="Servicios">Servicios</option>
                </select>
              </div>

              {/* Activity */}
              <div className="filter-group">
                <label>Última actividad</label>
                <select
                  id="filter-select-activity"
                  value={tempFilters.activity}
                  onChange={e => setTempFilters({ ...tempFilters, activity: e.target.value })}
                >
                  <option value="all">Cualquier momento</option>
                  <option value="today">Hoy</option>
                  <option value="7days">Últimos 7 días</option>
                  <option value="30days">Últimos 30 días</option>
                </select>
              </div>

              {/* Opportunity */}
              <div className="filter-group">
                <label>Oportunidades asociadas</label>
                <select
                  id="filter-select-opportunity"
                  value={tempFilters.opportunity}
                  onChange={e => setTempFilters({ ...tempFilters, opportunity: e.target.value })}
                >
                  <option value="all">Todas (con y sin oportunidades)</option>
                  <option value="with_opp">Con oportunidad abierta</option>
                  <option value="without_opp">Sin oportunidades</option>
                </select>
              </div>
            </div>

            <div className="filter-drawer-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleResetFilters}
              >
                Restablecer
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyFilters}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
