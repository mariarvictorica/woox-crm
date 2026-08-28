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
import { Opportunity, ActivityEvent, Contact, ViewType, Organization, LeadFilterState } from '../types';
import {
  EMPLOYEE_PROFILES,
  formatMoney,
  OPEN_STAGES,
  ORG_PROFILE_FIELDS,
  getOrgMissingFields,
  parseOpportunityCloseDate,
  MONTH_NAMES_ES,
  isoMonthKey,
  latestTwoMonths,
  computeDelta,
  getStageBreakdown,
  getRepPerformance,
  getContactsWithoutOpenOpp,
  getStaleContacts
} from '../data/initialData';
import type { OrgProfileFieldKey, UserProfileField } from '../data/initialData';
import { UserAvatar } from './UserAvatar';
import { OrgProfileChecklistBanner } from './OrgProfileChecklistBanner';
import { ProfileReminderBanner } from './ProfileReminderBanner';
import { PendingZone } from './PendingZone';
import { DashboardAttentionPanel, AttentionItem } from './DashboardAttentionPanel';
import { TeamPerformancePanel } from './TeamPerformancePanel';

/** Contacts untouched for this many days count as needing follow-up. */
const STALE_CONTACT_DAYS = 7;

interface DashboardViewProps {
  contacts?: Contact[];
  opportunities: Opportunity[];
  /** Real activity feed. App pushes an event on every meaningful action, so
   *  this reflects what happens during a session. */
  activities?: ActivityEvent[];
  /** Members of the signed-in user's organization, for the team rollup. */
  orgUsers?: { name: string; role: string }[];
  onNavigate?: (view: ViewType) => void;
  onNavigateToLeads?: (filters: Partial<LeadFilterState>) => void;
  onNavigateToOpportunities?: (filters: { stage?: string; rep?: string; segment?: string }) => void;
  onSelectOpportunity?: (oppId: number) => void;
  organization?: Organization;
  currentUserName?: string;
  /** Gates the setup item: only the Owner can act on those gaps. The logo and
   *  name in the header show for everyone in the organization. */
  isOrgOwner?: boolean;
  /** False for a sales rep: no team comparison, no organization-wide numbers,
   *  and their figures scoped to their own opportunities. */
  canSeeTeam?: boolean;
  onCompleteOrgProfile?: (field?: OrgProfileFieldKey) => void;
  /** Set only for someone who deferred the onboarding step, so the reminder
   *  reaches the person who postponed it and nobody else. */
  ownProfileMissing?: UserProfileField[];
  onCompleteOwnProfile?: () => void;
  onDismissProfileReminder?: () => void;
}

/**
 * The Manager's control centre, and — with canSeeTeam off — the rep's own.
 *
 * Ordered by what gets answered first: what needs doing, then how the
 * organization is doing, then sales detail, then the team, then what just
 * happened. Every number here is derived; the previous version invented the
 * bottom half of the page in the component and left three of six blocks with
 * nowhere to click.
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  contacts = [],
  opportunities,
  activities = [],
  orgUsers = [],
  onNavigate,
  onNavigateToLeads,
  onNavigateToOpportunities,
  onSelectOpportunity,
  organization,
  currentUserName,
  isOrgOwner = false,
  canSeeTeam = false,
  onCompleteOrgProfile,
  ownProfileMissing,
  onCompleteOwnProfile,
  onDismissProfileReminder
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const orgMissing = useMemo(
    () => (isOrgOwner ? getOrgMissingFields(organization) : []),
    [organization, isOrgOwner]
  );

  // A rep sees their own book; a manager sees the organization's.
  const scopedOpps = useMemo(
    () => (canSeeTeam ? opportunities : opportunities.filter(o => o.rep === currentUserName)),
    [opportunities, canSeeTeam, currentUserName]
  );

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
  // ---- Derived metrics. Every one of these comes from the data; where a
  // comparison isn't possible the KPI says so rather than showing a dash.

  const openOpps = useMemo(() => scopedOpps.filter(o => OPEN_STAGES.includes(o.stage)), [scopedOpps]);
  const openValue = useMemo(() => openOpps.reduce((s, o) => s + (o.value || 0), 0), [openOpps]);

  const stageBreakdown = useMemo(() => getStageBreakdown(scopedOpps), [scopedOpps]);
  const maxStageCount = Math.max(...stageBreakdown.map(s => s.count), 1);
  const activeStages = stageBreakdown.filter(s => OPEN_STAGES.includes(s.key));
  const closedStages = stageBreakdown.filter(s => !OPEN_STAGES.includes(s.key));

  /** Won amount for the latest month with data, and the change against the
   *  month before it. Anchored to the data, not to today. */
  const wonTrend = useMemo(() => {
    const byMonth = new Map<string, { amount: number; count: number }>();
    scopedOpps
      .filter(o => o.stage === 'ganado')
      .forEach(o => {
        const key = parseOpportunityCloseDate(o.close).monthKey;
        const entry = byMonth.get(key) || { amount: 0, count: 0 };
        entry.amount += o.value || 0;
        entry.count += 1;
        byMonth.set(key, entry);
      });
    const { current, previous } = latestTwoMonths([...byMonth.keys()]);
    const cur = current ? byMonth.get(current) : undefined;
    const prev = previous ? byMonth.get(previous) : undefined;
    const monthIndex = current ? parseInt(current.slice(5), 10) - 1 : -1;
    return {
      monthLabel: monthIndex >= 0 ? MONTH_NAMES_ES[monthIndex] : null,
      previousLabel: previous ? MONTH_NAMES_ES[parseInt(previous.slice(5), 10) - 1] : null,
      amount: cur?.amount ?? 0,
      count: cur?.count ?? 0,
      delta: computeDelta(cur?.amount ?? 0, prev?.amount)
    };
  }, [scopedOpps]);

  /** Closed-deal win rate. Global only: the seed's single lost opportunity has
   *  no close date, so there is no monthly denominator to trend against. */
  const winRate = useMemo(() => {
    const won = scopedOpps.filter(o => o.stage === 'ganado').length;
    const lost = scopedOpps.filter(o => o.stage === 'perdido').length;
    const closed = won + lost;
    return { pct: closed ? Math.round((won / closed) * 100) : null, won, closed };
  }, [scopedOpps]);

  /** New contacts for the latest month present in the data, vs the one before.
   *  createdAt is clean ISO, so this comparison is real. */
  const contactTrend = useMemo(() => {
    const byMonth = new Map<string, number>();
    contacts.forEach(c => {
      const key = isoMonthKey(c.createdAt);
      if (key) byMonth.set(key, (byMonth.get(key) || 0) + 1);
    });
    const { current, previous } = latestTwoMonths([...byMonth.keys()]);
    const monthIndex = current ? parseInt(current.slice(5), 10) - 1 : -1;
    return {
      monthLabel: monthIndex >= 0 ? MONTH_NAMES_ES[monthIndex] : null,
      previousLabel: previous ? MONTH_NAMES_ES[parseInt(previous.slice(5), 10) - 1] : null,
      count: current ? byMonth.get(current) || 0 : 0,
      delta: computeDelta(current ? byMonth.get(current) || 0 : 0, previous ? byMonth.get(previous) : undefined)
    };
  }, [contacts]);

  const repPerformance = useMemo(() => {
    const repNames = orgUsers.filter(u => u.role === 'Rep').map(u => u.name);
    return getRepPerformance(opportunities, repNames);
  }, [opportunities, orgUsers]);

  // ---- Attention queue. Only non-zero items reach the panel.
  const attentionItems = useMemo<AttentionItem[]>(() => {
    if (!canSeeTeam) return [];

    const withoutOpen = getContactsWithoutOpenOpp(contacts, opportunities);
    const hotWithoutOpen = withoutOpen.filter(c => c.hot);
    const stale = getStaleContacts(contacts, STALE_CONTACT_DAYS);

    const items: AttentionItem[] = [];

    if (hotWithoutOpen.length > 0) {
      items.push({
        key: 'hot-no-opp',
        count: hotWithoutOpen.length,
        label: 'Contactos prioritarios sin oportunidad',
        detail: hotWithoutOpen.slice(0, 2).map(c => c.name).join(', '),
        ctaLabel: 'Revisar',
        urgent: true,
        onAction: () => onNavigateToLeads?.({ priority: 'hot', opportunity: 'without_opp' })
      });
    }

    if (withoutOpen.length > 0) {
      items.push({
        key: 'no-opp',
        count: withoutOpen.length,
        label: 'Contactos sin oportunidad activa',
        detail: 'Nadie les abrió una oportunidad todavía',
        ctaLabel: 'Ver lista',
        onAction: () => onNavigateToLeads?.({ opportunity: 'without_opp' })
      });
    }

    if (stale.length > 0) {
      items.push({
        key: 'stale',
        count: stale.length,
        label: `Contactos sin actividad hace más de ${STALE_CONTACT_DAYS} días`,
        detail: 'El más antiguo, ' + Math.max(...stale.map(c => c.daysInactive ?? 0)) + ' días',
        ctaLabel: 'Ver lista',
        onAction: () => onNavigateToLeads?.({ activity: '7days' })
      });
    }

    return items;
  }, [canSeeTeam, contacts, opportunities, onNavigateToLeads]);

  const goToOpportunities = (filters: { stage?: string; rep?: string; segment?: string } = {}) => {
    if (onNavigateToOpportunities) onNavigateToOpportunities(filters);
    else onNavigate?.('opportunities');
  };

  const renderDelta = (
    delta: ReturnType<typeof computeDelta>,
    previousLabel: string | null,
    fallback: string
  ) => {
    if (!delta) return <div className="kpi-delta none">{fallback}</div>;
    const sign = delta.direction === 'up' ? '+' : '';
    return (
      <div className={`kpi-delta ${delta.direction}`}>
        {delta.direction !== 'flat' && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            {delta.direction === 'up' ? (
              <polyline points="6 15 12 9 18 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
        )}
        {sign}
        {delta.pct}% {previousLabel ? `vs ${previousLabel.toLowerCase()}` : ''}
      </div>
    );
  };

  return (
    <section id="view-dashboard" className="view active manager-dashboard-view">
      {/* 1. Header */}
      <header className="manager-dash-head" id="dash-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          {organization &&
            (organization.logoUrl ? (
              <img
                id="dash-org-logo"
                src={organization.logoUrl}
                alt={organization.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--r-md)',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid var(--border)'
                }}
              />
            ) : (
              // Same initial-on-soft-primary fallback the organization header
              // uses, so a tenant without a logo still reads as branded.
              <div
                id="dash-org-logo"
                aria-hidden="true"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {organization.name.trim()[0]?.toUpperCase() || 'O'}
              </div>
            ))}

          <div className="manager-dash-titles">
            <h1 id="dash-title">Panel del Manager · Dashboard</h1>
            <p id="dash-subtitle">
              {[organization?.name, currentUserName].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Lo primero: lo que está pendiente.

          Todo lo que reclama una acción del usuario va acá arriba y junto, antes
          de cualquier lista o número. Cada sección conserva su propia condición
          de visibilidad; la zona solo decide el lugar.

          Configuración antes de la cola comercial: lo primero que se pide es
          completar los datos que faltan, y recién después el seguimiento del
          día. El aviso de organización sigue siendo un bloque propio y no una
          fila más de la cola, porque su barra de progreso y sus atajos por campo
          dicen más que un conteo. */}
      <PendingZone>
        {orgMissing.length > 0 && (
          <OrgProfileChecklistBanner
            missing={orgMissing}
            total={ORG_PROFILE_FIELDS.length}
            onComplete={field => onCompleteOrgProfile?.(field)}
            scopeId={organization?.id}
          />
        )}

        {ownProfileMissing && ownProfileMissing.length > 0 && (
          <ProfileReminderBanner
            missing={ownProfileMissing}
            onComplete={() => onCompleteOwnProfile?.()}
            onDismiss={() => onDismissProfileReminder?.()}
          />
        )}

        {canSeeTeam && <DashboardAttentionPanel items={attentionItems} />}
      </PendingZone>

      {/* 3. La organización de un vistazo */}
      <div className="manager-kpi-grid" id="dash-kpis">
        <div
          className="manager-kpi-card clickable"
          id="kpi-open-pipeline"
          role="button"
          tabIndex={0}
          onClick={() => goToOpportunities({ segment: 'open' })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goToOpportunities({ segment: 'open' });
            }
          }}
          title="Ver las oportunidades abiertas"
        >
          <div className="kpi-label">{canSeeTeam ? 'Pipeline abierto' : 'Mi pipeline abierto'}</div>
          <div className="kpi-value">{formatMoney(openValue)}</div>
          <div className="kpi-sub">
            {openOpps.length} {openOpps.length === 1 ? 'oportunidad' : 'oportunidades'} en curso
          </div>
        </div>

        <div
          className="manager-kpi-card clickable"
          id="kpi-won-month"
          role="button"
          tabIndex={0}
          onClick={() => goToOpportunities({ segment: 'closed' })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goToOpportunities({ segment: 'closed' });
            }
          }}
          title="Ver las oportunidades cerradas"
        >
          <div className="kpi-label">
            Ganado en {wonTrend.monthLabel ? wonTrend.monthLabel.toLowerCase() : 'el período'}
          </div>
          <div className="kpi-value">{formatMoney(wonTrend.amount)}</div>
          <div className="kpi-sub">
            {wonTrend.count} {wonTrend.count === 1 ? 'acuerdo' : 'acuerdos'}
          </div>
          {renderDelta(wonTrend.delta, wonTrend.previousLabel, 'Sin mes anterior para comparar')}
        </div>

        <div
          className="manager-kpi-card clickable"
          id="kpi-win-rate"
          role="button"
          tabIndex={0}
          onClick={() => goToOpportunities({ segment: 'closed' })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goToOpportunities({ segment: 'closed' });
            }
          }}
          title="Ver las oportunidades cerradas"
        >
          <div className="kpi-label">Tasa de cierre</div>
          <div className="kpi-value">{winRate.pct === null ? '—' : `${winRate.pct}%`}</div>
          <div className="kpi-sub">
            {winRate.won} de {winRate.closed} cerradas
          </div>
          {/* Stated, not dashed: the lost opportunity has no close date, so
              there is no per-month denominator to trend against. */}
          <div className="kpi-delta none">Acumulado histórico</div>
        </div>

        {canSeeTeam && (
          <div
            className="manager-kpi-card clickable"
            id="kpi-new-contacts"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate?.('leads')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate?.('leads');
              }
            }}
            title="Ver todos los contactos"
          >
            <div className="kpi-label">
              Contactos nuevos en {contactTrend.monthLabel ? contactTrend.monthLabel.toLowerCase() : 'el período'}
            </div>
            <div className="kpi-value">{contactTrend.count}</div>
            <div className="kpi-sub">{contacts.length} en total</div>
            {renderDelta(contactTrend.delta, contactTrend.previousLabel, 'Sin mes anterior para comparar')}
          </div>
        )}
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
      {/* 5. Pipeline por etapa — cada fila es un filtro */}
      <div className="manager-two-col" id="dash-two-col">
        <div className="manager-card" id="card-pipeline-stages">
          <div className="manager-card-head">
            <h3>Pipeline por etapa</h3>
            <span className="head-meta">
              {stageBreakdown.length} etapas &middot; {scopedOpps.length} oportunidades
            </span>
          </div>

          <div className="stage-pipeline-list" id="pipeline-stage-list">
            {activeStages.map(stage => (
              <button
                type="button"
                className="stage-item-row clickable"
                key={stage.key}
                id={`stage-row-${stage.key}`}
                onClick={() => goToOpportunities({ stage: stage.key })}
                title={`Ver las oportunidades en ${stage.label}`}
              >
                <div className="stage-item-info">
                  <div className="stage-name-wrap">
                    <span className="stage-name">{stage.label}</span>
                  </div>
                  <div className="stage-counts">
                    {/* The monetary value was computed and discarded before. */}
                    <span className="stage-row-value">{formatMoney(stage.value)}</span>
                    <span className="stage-opps-badge">
                      {stage.count} {stage.count === 1 ? 'oportunidad' : 'oportunidades'}
                    </span>
                  </div>
                </div>
                <div className="stage-track">
                  <div
                    className="stage-fill"
                    style={{
                      width: `${Math.max(Math.round((stage.count / maxStageCount) * 100), stage.count > 0 ? 8 : 2)}%`,
                      background: stage.color
                    }}
                  />
                </div>
              </button>
            ))}

            <div className="stage-divider" />

            {closedStages.map(stage => (
              <button
                type="button"
                className="stage-item-row clickable"
                key={stage.key}
                id={`stage-row-${stage.key}`}
                onClick={() => goToOpportunities({ stage: stage.key })}
                title={`Ver las oportunidades en ${stage.label}`}
              >
                <div className="stage-item-info">
                  <div className="stage-name-wrap">
                    <span className="stage-name" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                  </div>
                  <div className="stage-counts">
                    <span className="stage-row-value">{formatMoney(stage.value)}</span>
                    <span className="stage-opps-badge">
                      {stage.count} {stage.count === 1 ? 'oportunidad' : 'oportunidades'}
                    </span>
                  </div>
                </div>
                <div className="stage-track">
                  <div
                    className={`stage-fill ${stage.key === 'ganado' ? 'won' : 'lost'}`}
                    style={{
                      width: `${Math.max(Math.round((stage.count / maxStageCount) * 100), stage.count > 0 ? 8 : 2)}%`
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. El equipo — solo para quien lo gestiona */}
        {canSeeTeam && repPerformance.length > 0 && (
          <TeamPerformancePanel
            reps={repPerformance}
            memberCount={orgUsers.length}
            onManageTeam={() => onNavigate?.('users')}
            onSelectRep={rep => goToOpportunities({ rep })}
          />
        )}
      </div>

      {/* 7. Qué pasó — ahora del feed real, no de un array fijo */}
      <div className="manager-activity-card" id="card-recent-activity">
        <div className="manager-card-head">
          <h3>Actividad reciente</h3>
          <span className="head-meta">Últimas acciones registradas</span>
        </div>

        {activities.length === 0 ? (
          <div className="empty-state" style={{ padding: '18px 0' }}>
            <div className="empty-state-desc">Todavía no hay actividad registrada.</div>
          </div>
        ) : (
          <div className="manager-activity-list" id="manager-team-activity-list">
            {activities.slice(0, 6).map(act => (
              <div className="manager-activity-row" key={act.id}>
                <div className="manager-activity-left">
                  <UserAvatar
                    name={act.author}
                    avatarUrl={act.avatarUrl || EMPLOYEE_PROFILES[act.author]?.avatarUrl}
                    size="lg"
                    type={act.type}
                  />
                  <div className="manager-activity-body">
                    <span className="rep-name">{act.author}</span>{' '}
                    <span className="action-text">{act.action}</span>
                    {act.highlight && <> <span className="target-entity">{act.highlight}</span></>}
                  </div>
                </div>
                <div className="manager-activity-time">{act.when}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
