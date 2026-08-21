import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { Opportunity, ActivityEvent, Contact, ViewType, StageKey } from '../types';
import { STAGE_LABEL, EMPLOYEE_PROFILES, formatMoney, OPEN_STAGES } from '../data/initialData';
import { UserAvatar } from './UserAvatar';

interface DashboardViewProps {
  contacts?: Contact[];
  opportunities: Opportunity[];
  activities?: ActivityEvent[];
  onNavigate?: (view: ViewType) => void;
  onNavigateToLeadsWithoutOpp?: () => void;
  onSelectOpportunity?: (oppId: number) => void;
}

interface TeamActivity {
  id: string;
  repName: string;
  repInitials: string;
  repAvatarUrl?: string;
  actionText: string;
  targetEntity: string;
  timestamp: string;
}

const DEFAULT_TEAM_ACTIVITIES: TeamActivity[] = [
  {
    id: 'act-1',
    repName: 'Diego',
    repInitials: 'D',
    repAvatarUrl: EMPLOYEE_PROFILES['Diego']?.avatarUrl,
    actionText: 'movió la oportunidad',
    targetEntity: 'Acabado exterior — 3 terrazas a Negociación',
    timestamp: 'hace 12 min'
  },
  {
    id: 'act-2',
    repName: 'Maribel',
    repInitials: 'M',
    repAvatarUrl: EMPLOYEE_PROFILES['Maribel']?.avatarUrl,
    actionText: 'registró una nota en',
    targetEntity: 'Contratista García (Landeros Arquitectura)',
    timestamp: 'hace 28 min'
  },
  {
    id: 'act-3',
    repName: 'Adamaris',
    repInitials: 'A',
    repAvatarUrl: EMPLOYEE_PROFILES['Adamaris']?.avatarUrl,
    actionText: 'subió un archivo a',
    targetEntity: 'Proyecto fachada residencial (Ficha_Tecnica.pdf)',
    timestamp: 'hace 1 h'
  },
  {
    id: 'act-4',
    repName: 'Diego',
    repInitials: 'D',
    repAvatarUrl: EMPLOYEE_PROFILES['Diego']?.avatarUrl,
    actionText: 'creó un contacto desde',
    targetEntity: 'Online (WhatsApp) · Ing. Carlos Mendoza',
    timestamp: 'hace 2 h'
  },
  {
    id: 'act-5',
    repName: 'Adamaris',
    repInitials: 'A',
    repAvatarUrl: EMPLOYEE_PROFILES['Adamaris']?.avatarUrl,
    actionText: 'movió la oportunidad',
    targetEntity: 'Compra mostrador retail a Ganado',
    timestamp: 'hace 3 h'
  },
  {
    id: 'act-6',
    repName: 'Enrique Macias',
    repInitials: 'EM',
    repAvatarUrl: EMPLOYEE_PROFILES['Enrique Macias']?.avatarUrl,
    actionText: 'reasignó 3 contactos a',
    targetEntity: 'Maribel · Zona Hotelera Cancún',
    timestamp: 'hace 4 h'
  }
];

interface ParsedCloseDate {
  dateObj: Date | null;
  formattedDate: string;
  monthKey: string;
  monthName: string;
  monthShort: string;
  timestamp: number;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_SHORTS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

function parseOpportunityCloseDate(closeStr?: string): ParsedCloseDate {
  if (!closeStr || closeStr === '—' || closeStr === '-') {
    return {
      dateObj: null,
      formattedDate: 'Fecha no especificada',
      monthKey: '9999-99',
      monthName: 'Sin fecha',
      monthShort: 'S/F',
      timestamp: 0
    };
  }

  // 1. Check ISO format YYYY-MM-DD
  const isoMatch = closeStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[month]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[month]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[month]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  // 2. Check Spanish format like "30 jul 2026", "1 ago 2026", "14 ago 2026"
  const spanishMonths: Record<string, number> = {
    ene: 0, enero: 0,
    feb: 1, febrero: 1,
    mar: 2, marzo: 2,
    abr: 3, abril: 3,
    may: 4, mayo: 4,
    jun: 5, junio: 5,
    jul: 6, julio: 6,
    ago: 7, agosto: 7,
    sep: 8, sept: 8, septiembre: 8,
    oct: 9, octubre: 9,
    nov: 10, noviembre: 10,
    dic: 11, diciembre: 11
  };
  const spMatch = closeStr.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})/);
  if (spMatch) {
    const day = parseInt(spMatch[1], 10);
    const monthStr = spMatch[2].toLowerCase();
    const year = parseInt(spMatch[3], 10);
    const monthIndex = spanishMonths[monthStr] !== undefined ? spanishMonths[monthStr] : 7;
    const d = new Date(year, monthIndex, day);
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[monthIndex]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[monthIndex]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[monthIndex]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  // 3. Fallback standard parse
  const parsed = Date.parse(closeStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[month]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[month]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[month]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  return {
    dateObj: null,
    formattedDate: closeStr,
    monthKey: '9999-99',
    monthName: 'Sin fecha',
    monthShort: 'S/F',
    timestamp: 0
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contacts = [],
  opportunities,
  onNavigate,
  onNavigateToLeadsWithoutOpp,
  onSelectOpportunity
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 1. Process won opportunities grouped by month
  const wonData = useMemo(() => {
    const wonOpps = opportunities.filter(o => o.stage === 'ganado');

    const contactMap = new Map<number, Contact>();
    contacts.forEach(c => contactMap.set(c.id, c));

    // Enrich each won opp with contact info & parsed close date
    const enrichedDeals = wonOpps.map(opp => {
      const contact = contactMap.get(opp.contactId);
      const parsedDate = parseOpportunityCloseDate(opp.close);
      return {
        id: opp.id,
        name: opp.name,
        value: opp.value || 0,
        contactName: contact ? contact.name : 'Contacto sin nombre',
        company: contact?.company,
        rep: opp.rep,
        closeDateFormatted: parsedDate.formattedDate,
        closeRaw: opp.close,
        monthKey: parsedDate.monthKey,
        monthName: parsedDate.monthName,
        monthShort: parsedDate.monthShort,
        timestamp: parsedDate.timestamp
      };
    });

    // Group into months
    const monthGroups: Record<string, {
      monthKey: string;
      monthName: string;
      monthShort: string;
      totalAmount: number;
      count: number;
      deals: typeof enrichedDeals;
    }> = {};

    enrichedDeals.forEach(deal => {
      if (!monthGroups[deal.monthKey]) {
        monthGroups[deal.monthKey] = {
          monthKey: deal.monthKey,
          monthName: deal.monthName,
          monthShort: deal.monthShort,
          totalAmount: 0,
          count: 0,
          deals: []
        };
      }
      monthGroups[deal.monthKey].totalAmount += deal.value;
      monthGroups[deal.monthKey].count += 1;
      monthGroups[deal.monthKey].deals.push(deal);
    });

    // Sort months chronologically
    const sortedMonths = Object.values(monthGroups).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // Sort deals inside each month descending by date / id
    sortedMonths.forEach(m => {
      m.deals.sort((a, b) => b.timestamp - a.timestamp || b.id - a.id);
    });

    const totalWonAmount = enrichedDeals.reduce((sum, d) => sum + d.value, 0);
    const totalWonCount = enrichedDeals.length;

    return {
      allDeals: enrichedDeals.sort((a, b) => b.timestamp - a.timestamp || b.id - a.id),
      sortedMonths,
      totalWonAmount,
      totalWonCount
    };
  }, [opportunities, contacts]);

  // Available months options for dropdown (full current year 2026 + any extra months in data)
  const availableMonthOptions = useMemo(() => {
    const default2026Months = [
      { key: '2026-01', name: 'Enero 2026' },
      { key: '2026-02', name: 'Febrero 2026' },
      { key: '2026-03', name: 'Marzo 2026' },
      { key: '2026-04', name: 'Abril 2026' },
      { key: '2026-05', name: 'Mayo 2026' },
      { key: '2026-06', name: 'Junio 2026' },
      { key: '2026-07', name: 'Julio 2026' },
      { key: '2026-08', name: 'Agosto 2026' },
      { key: '2026-09', name: 'Septiembre 2026' },
      { key: '2026-10', name: 'Octubre 2026' },
      { key: '2026-11', name: 'Noviembre 2026' },
      { key: '2026-12', name: 'Diciembre 2026' },
    ];

    const map = new Map<string, string>();
    default2026Months.forEach(m => map.set(m.key, m.name));
    wonData.sortedMonths.forEach(m => {
      if (!map.has(m.monthKey)) {
        map.set(m.monthKey, m.monthName);
      }
    });

    return Array.from(map.entries())
      .map(([key, name]) => {
        const stats = wonData.sortedMonths.find(sm => sm.monthKey === key);
        return {
          key,
          name,
          count: stats ? stats.count : 0,
          totalAmount: stats ? stats.totalAmount : 0
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [wonData.sortedMonths]);

  // Current active month (defaults to August 2026 or latest month with data)
  const currentMonthKey = useMemo(() => {
    if (selectedMonthFilter) {
      return selectedMonthFilter;
    }
    const hasAugust = wonData.sortedMonths.some(m => m.monthKey === '2026-08');
    if (hasAugust) return '2026-08';
    if (wonData.sortedMonths.length > 0) {
      return wonData.sortedMonths[wonData.sortedMonths.length - 1].monthKey;
    }
    return '2026-08';
  }, [selectedMonthFilter, wonData.sortedMonths]);

  const currentMonthOption = availableMonthOptions.find(m => m.key === currentMonthKey);

  // Filtered deals to display in the list below the chart
  const displayedDeals = useMemo(() => {
    if (!currentMonthKey) {
      return wonData.allDeals;
    }
    return wonData.allDeals.filter(d => d.monthKey === currentMonthKey);
  }, [wonData, currentMonthKey]);

  // 1. Metric Computations
  const openOpps = opportunities.filter(o => OPEN_STAGES.includes(o.stage));
  
  const contactIdsWithActiveOpp = new Set(
    opportunities
      .filter(o => OPEN_STAGES.includes(o.stage))
      .map(o => o.contactId)
  );
  const leadsWithoutActiveOpp = contacts.length > 0
    ? contacts.filter(c => !contactIdsWithActiveOpp.has(c.id)).length
    : 4;

  // 2. Stage Breakdown Computations
  const allStages: StageKey[] = ['nuevo', 'contactado', 'calificado', 'negociacion', 'ganado', 'perdido'];
  
  const stageStats = allStages.map(stageKey => {
    const oppsInStage = opportunities.filter(o => o.stage === stageKey);
    const count = oppsInStage.length;
    const value = oppsInStage.reduce((sum, o) => sum + (o.value || 0), 0);
    return {
      key: stageKey,
      label: STAGE_LABEL[stageKey],
      count,
      value
    };
  });

  const maxStageCount = Math.max(...stageStats.map(s => s.count), 1);
  const activeStageStats = stageStats.filter(s => ['nuevo', 'contactado', 'calificado', 'negociacion'].includes(s.key));
  const closedStageStats = stageStats.filter(s => ['ganado', 'perdido'].includes(s.key));

  // 3. New Leads Today Breakdown
  const totalTodayLeads = 12;
  const todayBreakdown = [
    {
      id: 'online',
      name: 'Online',
      tag: 'Prioridad 1',
      description: 'WhatsApp, Instagram, Facebook',
      count: 7,
      pct: 58,
      fillClass: 'online'
    },
    {
      id: 'b2b',
      name: 'B2B',
      tag: 'Prioridad 2',
      description: 'Constructoras, arquitectos, empresas',
      count: 3,
      pct: 25,
      fillClass: 'b2b'
    },
    {
      id: 'retail',
      name: 'Retail',
      tag: 'Prioridad 3',
      description: 'Mostrador y particulares',
      count: 2,
      pct: 17,
      fillClass: 'retail'
    }
  ];

  return (
    <section id="view-dashboard" className="view active manager-dashboard-view">
      {/* 1. Header */}
      <header className="manager-dash-head" id="dash-head">
        <div className="manager-dash-titles">
          <h1 id="dash-title">Panel del Manager · Dashboard</h1>
          <p id="dash-subtitle">Woox Pinturas y Acabados S.A. de C.V. · Enrique Macias</p>
        </div>
      </header>

      {/* 2. Tarjetas Métricas: Contactos sin oportunidad activa & Oportunidades activas */}
      <div className="manager-kpi-grid" id="dash-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Card 1: Contactos sin oportunidad activa (Amber Highlight / Action Metric) */}
        <div
          className="manager-kpi-card kpi-warning clickable"
          id="kpi-leads-no-opp"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (onNavigateToLeadsWithoutOpp) {
              onNavigateToLeadsWithoutOpp();
            } else {
              onNavigate?.('leads');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (onNavigateToLeadsWithoutOpp) {
                onNavigateToLeadsWithoutOpp();
              } else {
                onNavigate?.('leads');
              }
            }
          }}
          title="Hacer clic para ver la lista de contactos sin oportunidad activa"
        >
          <div className="kpi-label">Contactos sin oportunidad activa</div>
          <div className="kpi-value">{leadsWithoutActiveOpp}</div>
          <div className="kpi-action-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Acción requerida · Ver lista &rarr;
          </div>
        </div>

        {/* Card 2: Oportunidades activas */}
        <div
          className="manager-kpi-card clickable"
          id="kpi-open-opps"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate?.('opportunities')}
          title="Ver pipeline de oportunidades activas"
        >
          <div className="kpi-label">Oportunidades activas</div>
          <div className="kpi-value">{openOpps.length}</div>
          <div className="kpi-sub">En etapas de Nuevo, Contactado, Calificado y Negociación</div>
        </div>
      </div>

      {/* 3. Sección: Diagrama de Barras de Oportunidades Ganadas por Mes con sus Fechas */}
      <div className="won-chart-card" id="card-won-opps-by-month">
        <div className="won-chart-header">
          <div className="won-chart-title-wrap">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Oportunidades ganadas por mes
            </h3>
            <p>Evolución de ventas cerradas y fechas de cierre por periodo mensual</p>
          </div>

          <div className="won-chart-controls">
            <div className="won-metric-pill" id="won-summary-pill">
              <span>Total ganado:</span>
              <strong>{formatMoney(wonData.totalWonAmount)}</strong>
              <span>· {wonData.totalWonCount} {wonData.totalWonCount === 1 ? 'acuerdo' : 'acuerdos'}</span>
            </div>
          </div>
        </div>

        {/* Diagrama de Barras con Recharts */}
        <div className="won-chart-container" id="won-barchart-container">
          {wonData.sortedMonths.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={wonData.sortedMonths}
                margin={{ top: 16, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="monthShort"
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  tick={{ fill: 'var(--charcoal)', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--graphite)', fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: 'var(--good-bg)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as {
                        monthName: string;
                        totalAmount: number;
                        count: number;
                      };
                      return (
                        <div className="won-tooltip-box">
                          <div className="won-tooltip-header">{data.monthName}</div>
                          <div className="won-tooltip-stat">
                            <span>Monto cerrado:</span>
                            <strong>{formatMoney(data.totalAmount)}</strong>
                          </div>
                          <div className="won-tooltip-stat">
                            <span>Acuerdos ganados:</span>
                            <span>{data.count} {data.count === 1 ? 'oportunidad' : 'oportunidades'}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="totalAmount"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                >
                  {wonData.sortedMonths.map((entry, index) => {
                    const isSelected = currentMonthKey === entry.monthKey;
                    const isHovered = hoveredBarIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isSelected ? 'var(--good-deep)' : isHovered ? 'var(--good-bright)' : 'var(--good)'}
                        cursor="pointer"
                        onClick={() => {
                          setSelectedMonthFilter(entry.monthKey);
                        }}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '32px 16px', margin: 0 }}>
              <div className="empty-state-title">Aún no hay oportunidades ganadas</div>
              <div className="empty-state-desc">
                Las oportunidades marcadas como "Ganado" con su fecha estimada de cierre aparecerán aquí en el diagrama de barras mensual.
              </div>
            </div>
          )}
        </div>

        {/* Desglose de Acuerdos Ganados con sus Fechas */}
        <div className="won-deals-breakdown" id="won-deals-breakdown-section">
          <div className="won-deals-section-head" id="won-deals-section-head">
            <h4>Detalle de acuerdos ganados y fechas</h4>

            <div className="won-month-select-wrapper" id="won-month-select-wrapper">
              <label htmlFor="won-month-dropdown" className="won-month-select-label">
                Mes:
              </label>
              <select
                id="won-month-dropdown"
                className="won-month-select"
                value={currentMonthKey}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
              >
                {availableMonthOptions.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.name} {m.count > 0 ? `· ${m.count} ${m.count === 1 ? 'acuerdo' : 'acuerdos'} (${formatMoney(m.totalAmount)})` : '· (0 acuerdos)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="won-deals-list" id="won-deals-list-items">
            {displayedDeals.length > 0 ? (
              displayedDeals.map(deal => (
                <div
                  key={deal.id}
                  className="won-deal-row"
                  id={`won-deal-item-${deal.id}`}
                >
                  <div className="won-deal-left">
                    <div className="won-date-badge" title="Fecha de cierre">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{deal.closeDateFormatted}</span>
                    </div>

                    <div className="won-deal-info">
                      <div
                        className="won-deal-name"
                        style={{ cursor: onSelectOpportunity ? 'pointer' : 'default' }}
                        onClick={() => onSelectOpportunity?.(deal.id)}
                        title="Ver detalle de la oportunidad"
                      >
                        {deal.name}
                      </div>
                      <div className="won-deal-sub">
                        <span>{deal.contactName} {deal.company ? `— ${deal.company}` : ''}</span>
                        <span>&middot;</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserAvatar name={deal.rep} size="xs" />
                          <span>{deal.rep}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="won-deal-right">
                    <div className="won-deal-value">
                      +{formatMoney(deal.value)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--graphite)',
                  fontSize: '13px',
                  background: 'var(--cloud)',
                  borderRadius: 'var(--r-md)',
                  border: '1px dashed var(--border)'
                }}
              >
                No se registraron oportunidades ganadas en <strong>{currentMonthOption?.name || 'este periodo'}</strong>.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Row of 2 Columns */}
      <div className="manager-two-col" id="dash-two-col" style={{ marginTop: '20px' }}>
        {/* Wide Left Column: Pipeline por etapa */}
        <div className="manager-card" id="card-pipeline-stages">
          <div className="manager-card-head">
            <h3>Pipeline por etapa</h3>
            <span className="head-meta">6 etapas · {opportunities.length} oportunidades totales</span>
          </div>

          <div className="stage-pipeline-list" id="pipeline-stage-list">
            {/* Active Stages */}
            {activeStageStats.map(stage => {
              const widthPct = Math.max(Math.round((stage.count / maxStageCount) * 100), stage.count > 0 ? 8 : 2);
              return (
                <div className="stage-item-row" key={stage.key} id={`stage-row-${stage.key}`}>
                  <div className="stage-item-info">
                    <div className="stage-name-wrap">
                      <span className="stage-name">{stage.label}</span>
                    </div>
                    <div className="stage-counts">
                      <span className="stage-opps-badge">{stage.count} {stage.count === 1 ? 'oportunidad' : 'oportunidades'}</span>
                    </div>
                  </div>
                  <div className="stage-track">
                    <div
                      className="stage-fill"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Separator for Ganado & Perdido */}
            <div className="stage-divider" />

            {/* Closed Stages */}
            {closedStageStats.map(stage => {
              const isWon = stage.key === 'ganado';
              const widthPct = Math.max(Math.round((stage.count / maxStageCount) * 100), stage.count > 0 ? 8 : 2);
              return (
                <div className="stage-item-row" key={stage.key} id={`stage-row-${stage.key}`}>
                  <div className="stage-item-info">
                    <div className="stage-name-wrap">
                      <span className="stage-name" style={{ color: isWon ? 'var(--good)' : 'var(--graphite)' }}>
                        {stage.label}
                      </span>
                    </div>
                    <div className="stage-counts">
                      <span
                        className="stage-opps-badge"
                        style={{ color: isWon ? 'var(--good)' : 'var(--graphite)' }}
                      >
                        {stage.count} {stage.count === 1 ? 'oportunidad' : 'oportunidades'}
                      </span>
                    </div>
                  </div>
                  <div className="stage-track">
                    <div
                      className={`stage-fill ${isWon ? 'won' : 'lost'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrow Right Column: Nuevos contactos de hoy */}
        <div className="manager-card" id="card-leads-today">
          <div className="manager-card-head">
            <h3>Nuevos contactos de hoy</h3>
            <span className="head-meta">Por canal de origen</span>
          </div>

          <div className="today-leads-box">
            {/* Desglose en Orden Exacto: Online, B2B, Retail */}
            <div className="origin-priority-list" id="origin-priority-breakdown">
              {todayBreakdown.map(origin => (
                <div className="origin-item-row" key={origin.id} id={`origin-row-${origin.id}`}>
                  <div className="origin-info-head">
                    <div className="origin-name">
                      <span>{origin.name}</span>
                      <span className="origin-priority-tag">{origin.tag}</span>
                    </div>
                    <div className="origin-counts">
                      <span>{origin.count} contactos</span>
                      <span className="origin-pct">({origin.pct}%)</span>
                    </div>
                  </div>
                  <div className="origin-track">
                    <div
                      className={`origin-fill ${origin.fillClass}`}
                      style={{ width: `${origin.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full Width: Actividad reciente del equipo */}
      <div className="manager-activity-card" id="card-recent-activity" style={{ marginTop: '20px' }}>
        <div className="manager-card-head">
          <h3>Actividad reciente del equipo</h3>
          <span className="head-meta">Últimas acciones registradas</span>
        </div>

        <div className="manager-activity-list" id="manager-team-activity-list">
          {DEFAULT_TEAM_ACTIVITIES.map(act => (
            <div className="manager-activity-row" key={act.id}>
              <div className="manager-activity-left">
                {/* Avatar circular del rep */}
                <div className="manager-activity-avatar">
                  {act.repAvatarUrl ? (
                    <img src={act.repAvatarUrl} alt={act.repName} referrerPolicy="no-referrer" />
                  ) : (
                    <span>{act.repInitials}</span>
                  )}
                </div>

                <div className="manager-activity-body">
                  <span className="rep-name">{act.repName}</span>{' '}
                  <span className="action-text">{act.actionText}</span>{' '}
                  <span className="target-entity">{act.targetEntity}</span>
                </div>
              </div>

              <div className="manager-activity-time">{act.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
