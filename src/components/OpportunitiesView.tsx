import React, { useState, useMemo, useEffect } from 'react';
import { Opportunity, Contact, OppSegment, StageKey } from '../types';
import { STAGE_CONFIG, STAGE_LABEL, OPEN_STAGES } from '../data/initialData';
import { UserAvatar } from './UserAvatar';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  contacts: Contact[];
  onSelectOpportunity: (oppId: number) => void;
  onSelectLead: (leadId: number) => void;
  onOpenNewOppModal: () => void;
  /** Arriving from a Dashboard row: land on that stage, rep or segment.
   *  Mirrors LeadsView's initialFilters so both deep-links work the same way. */
  initialFilters?: { stage?: StageKey; rep?: string; segment?: OppSegment } | null;
}

export type OppSortField = 'name' | 'client' | 'rep' | 'last' | 'lastStageChange';
export type SortDirection = 'asc' | 'desc' | null;

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  contacts,
  onSelectOpportunity,
  onSelectLead,
  onOpenNewOppModal,
  initialFilters
}) => {
  const [segment, setSegment] = useState<OppSegment>(initialFilters?.segment || 'open');
  const [searchTerm, setSearchTerm] = useState('');
  const [repFilter, setRepFilter] = useState(initialFilters?.rep || '');
  // Set from the Dashboard's pipeline rows; cleared as soon as the user picks
  // a segment, since "Cerradas" and "stage = nuevo" would contradict.
  const [stageFilter, setStageFilter] = useState<StageKey | null>(initialFilters?.stage || null);
  const [sortField, setSortField] = useState<OppSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<StageKey, boolean>>({
    nuevo: false,
    contactado: false,
    calificado: false,
    negociacion: false,
    ganado: false,
    perdido: false
  });

  const handleSort = (field: OppSortField) => {
    const defaultDir: SortDirection = 'asc';
    const altDir: SortDirection = 'desc';

    if (sortField !== field) {
      setSortField(field);
      setSortDirection(defaultDir);
    } else if (sortDirection === defaultDir) {
      setSortDirection(altDir);
    } else if (sortDirection === altDir) {
      // 3rd action: back to neutral
      setSortField(null);
      setSortDirection(null);
    } else {
      setSortField(field);
      setSortDirection(defaultDir);
    }
  };

  const toggleGroup = (stageKey: StageKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [stageKey]: !prev[stageKey]
    }));
  };

  const contactMap = useMemo(() => {
    const map = new Map<number, Contact>();
    contacts.forEach(c => map.set(c.id, c));
    return map;
  }, [contacts]);

  useEffect(() => {
    if (!initialFilters) return;
    setStageFilter(initialFilters.stage || null);
    setRepFilter(initialFilters.rep || '');
    // A stage implies looking at everything, or the segment could hide it.
    setSegment(initialFilters.segment || (initialFilters.stage ? 'all' : 'open'));
  }, [initialFilters]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      if (segment === 'open' && !OPEN_STAGES.includes(o.stage)) return false;
      if (segment === 'closed' && OPEN_STAGES.includes(o.stage)) return false;

      if (stageFilter && o.stage !== stageFilter) return false;
      if (repFilter && o.rep !== repFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const c = contactMap.get(o.contactId);
        const hay = `${o.name} ${c ? c.name : ''} ${c?.company ? c.company : ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });
  }, [opportunities, segment, stageFilter, repFilter, searchTerm, contactMap]);

  return (
    <section id="view-opportunities" className="view active">
      <div className="page-head" id="opps-head">
        <div>
          <h1>Oportunidades</h1>
          <p>Ventas en curso, ligadas a cada contacto</p>
        </div>
        <div className="head-actions">
          <button
            id="btn-open-opp-modal"
            className="btn btn-primary"
            onClick={onOpenNewOppModal}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva oportunidad
          </button>
        </div>
      </div>

      <div className="filter-bar" id="opps-filter-bar">
        <div className="seg" id="opps-segmented-control">
          <button
            id="seg-opp-open"
            className={segment === 'open' ? 'active' : ''}
            onClick={() => { setSegment('open'); setStageFilter(null); }}
          >
            Abiertas
          </button>
          <button
            id="seg-opp-all"
            className={segment === 'all' ? 'active' : ''}
            onClick={() => { setSegment('all'); setStageFilter(null); }}
          >
            Todas
          </button>
          <button
            id="seg-opp-closed"
            className={segment === 'closed' ? 'active' : ''}
            onClick={() => { setSegment('closed'); setStageFilter(null); }}
          >
            Cerradas
          </button>
        </div>

      {(stageFilter || repFilter) && (
        <div
          id="opps-filter-notice"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            background: 'var(--warn-surface)',
            border: '1px solid var(--warn-soft-strong)',
            borderRadius: '8px',
            padding: '9px 14px',
            margin: '12px 0',
            fontSize: '13px',
            color: 'var(--warn-ink)'
          }}
        >
          <span>
            Filtro activo desde el Dashboard:{' '}
            <b>
              {[stageFilter && STAGE_LABEL[stageFilter], repFilter].filter(Boolean).join(' · ')}
            </b>{' '}
            ({filteredOpportunities.length}{' '}
            {filteredOpportunities.length === 1 ? 'oportunidad' : 'oportunidades'})
          </span>
          <button
            type="button"
            id="btn-clear-opps-filter"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setStageFilter(null);
              setRepFilter('');
              setSegment('open');
            }}
            style={{ color: 'var(--warn-deep)', background: 'var(--warn-soft)', borderRadius: '4px' }}
          >
            Quitar filtro
          </button>
        </div>
      )}

        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.6" y2="16.6" />
          </svg>
          <input
            id="opp-search"
            type="text"
            placeholder="Buscar oportunidad o contacto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          id="opp-rep-filter"
          value={repFilter}
          onChange={e => setRepFilter(e.target.value)}
        >
          <option value="">Todos los representantes</option>
          <option value="Maria Torres">Maria Torres</option>
          <option value="Adamaris">Adamaris</option>
          <option value="Diego">Diego</option>
        </select>
      </div>

      <div id="opp-groups">
        {STAGE_CONFIG.map(stage => {
          const rawItems = filteredOpportunities.filter(o => o.stage === stage.key);
          const isCollapsed = !!collapsedGroups[stage.key];

          const items = (!sortField || !sortDirection)
            ? rawItems
            : [...rawItems].sort((a, b) => {
                let comp = 0;
                const ca = contactMap.get(a.contactId)?.name || '';
                const cb = contactMap.get(b.contactId)?.name || '';

                switch (sortField) {
                  case 'name':
                    comp = a.name.localeCompare(b.name, 'es');
                    break;
                  case 'client':
                    comp = ca.localeCompare(cb, 'es');
                    break;
                  case 'rep':
                    comp = a.rep.localeCompare(b.rep, 'es');
                    break;
                  case 'last':
                    comp = a.last.localeCompare(b.last, 'es');
                    break;
                  case 'lastStageChange':
                    comp = a.lastStageChange.localeCompare(b.lastStageChange, 'es');
                    break;
                  default:
                    comp = 0;
                }
                return sortDirection === 'asc' ? comp : -comp;
              });

          return (
            <div
              key={stage.key}
              className={`group-block ${isCollapsed ? 'collapsed' : ''}`}
            >
              <div
                className="group-header"
                onClick={() => toggleGroup(stage.key)}
              >
                <div className="group-header-left">
                  <svg
                    className="chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  <span className="dot" style={{ background: stage.color }}></span>
                  <span className="gname">{STAGE_LABEL[stage.key]}</span>
                  <span className="gcount">{items.length}</span>
                </div>
              </div>

              {!isCollapsed && (
                <div className="group-table-wrap">
                  <table>
                    <colgroup>
                      <col className="col-opp" />
                      <col className="col-client" />
                      <col className="col-rep" />
                      <col className="col-last" />
                      <col className="col-stage-change" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th
                          className={`th-sortable ${sortField === 'name' ? 'is-sorted' : ''}`}
                          onClick={() => handleSort('name')}
                        >
                          <div className="th-sort-inner">
                            <span>Oportunidad</span>
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
                          className={`th-sortable ${sortField === 'client' ? 'is-sorted' : ''}`}
                          onClick={() => handleSort('client')}
                        >
                          <div className="th-sort-inner">
                            <span>Cliente</span>
                            <span className="th-sort-icon">
                              {sortField === 'client' ? (
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
                          className={`th-sortable ${sortField === 'rep' ? 'is-sorted' : ''}`}
                          onClick={() => handleSort('rep')}
                        >
                          <div className="th-sort-inner">
                            <span>Representante de Ventas</span>
                            <span className="th-sort-icon">
                              {sortField === 'rep' ? (
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
                          className={`th-sortable ${sortField === 'last' ? 'is-sorted' : ''}`}
                          onClick={() => handleSort('last')}
                        >
                          <div className="th-sort-inner">
                            <span>Última actividad</span>
                            <span className="th-sort-icon">
                              {sortField === 'last' ? (
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
                          className={`th-sortable ${sortField === 'lastStageChange' ? 'is-sorted' : ''}`}
                          onClick={() => handleSort('lastStageChange')}
                        >
                          <div className="th-sort-inner">
                            <span>Últ. cambio de estado</span>
                            <span className="th-sort-icon">
                              {sortField === 'lastStageChange' ? (
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
                      {items.length === 0 ? (
                        <tr className="opp-empty-row">
                          <td colSpan={5}>Sin oportunidades en esta etapa</td>
                        </tr>
                      ) : (
                        items.map(o => {
                          const c = contactMap.get(o.contactId);
                          return (
                            <tr
                              key={o.id}
                              className="lead-row"
                              onClick={() => onSelectOpportunity(o.id)}
                            >
                              <td>
                                <div className="opp-row-name">{o.name}</div>
                              </td>
                              <td>
                                {c ? (
                                  <span
                                    className="opp-client-cell"
                                    title={`${c.name}${c.company ? ` — ${c.company}` : ''}`}
                                  >
                                    <button
                                      type="button"
                                      className="opp-contact-link"
                                      title={`Ver detalle de ${c.name}`}
                                      onClick={e => {
                                        e.stopPropagation();
                                        onSelectLead(c.id);
                                      }}
                                    >
                                      {c.name}
                                    </button>
                                    {c.company ? ` — ${c.company}` : ''}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                                  <UserAvatar name={o.rep} size="sm" />
                                  <span style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{o.rep}</span>
                                </div>
                              </td>
                              <td className="lead-sub">{o.last}</td>
                              <td className="lead-sub">{o.lastStageChange}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
