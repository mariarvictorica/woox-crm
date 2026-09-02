import React, { useState, useMemo } from 'react';
import { Opportunity, ActivityEvent, Contact, ViewType, Organization, LeadFilterState } from '../types';
import {
  EMPLOYEE_PROFILES,
  formatMoney,
  OPEN_STAGES,
  ORG_PROFILE_FIELDS,
  USER_PROFILE_FIELDS,
  listFieldLabels,
  monthRange,
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
import { AccountSetupSection, SetupRow } from './AccountSetupSection';
import { PendingZone } from './PendingZone';
import { DashboardAttentionPanel, AttentionItem } from './DashboardAttentionPanel';
import { TeamPerformancePanel } from './TeamPerformancePanel';
import { PipelineStageCards } from './PipelineStageCards';
import { WonByMonthChart } from './WonByMonthChart';

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
  /** Which of the user's own optional fields are still empty. */
  ownProfileMissing?: UserProfileField[];
  /** True once "Más tarde" was pressed. Silences the whole section — both rows,
   *  not one — which is why it is a prop and not derived per row. */
  accountSetupDismissed?: boolean;
  onCompleteOwnProfile?: () => void;
  /** "Más tarde": puts the whole setup section away permanently. */
  onDismissAccountSetup?: () => void;
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
  accountSetupDismissed = false,
  onCompleteOwnProfile,
  onDismissAccountSetup
}) => {

  const orgMissing = useMemo(
    () => (isOrgOwner ? getOrgMissingFields(organization) : []),
    [organization, isOrgOwner]
  );

  /**
   * One row per pending setup task that applies to this user. Each is judged on
   * its own from the live data — the organization row simply never gets built
   * for someone who does not own one, whatever the state of that data.
   *
   * Memoized because the section uses this array's identity to animate a row
   * out when it completes.
   */
  const setupRows = useMemo<SetupRow[]>(() => {
    if (accountSetupDismissed) return [];

    const rows: SetupRow[] = [];

    if (ownProfileMissing && ownProfileMissing.length > 0) {
      rows.push({
        key: 'profile',
        label: 'Tu perfil',
        hint: `Falta tu ${listFieldLabels(ownProfileMissing)}.`,
        completed: USER_PROFILE_FIELDS.length - ownProfileMissing.length,
        total: USER_PROFILE_FIELDS.length,
        onComplete: () => onCompleteOwnProfile?.()
      });
    }

    if (orgMissing.length > 0) {
      rows.push({
        key: 'organization',
        label: 'Perfil de la organización',
        hint: `Falta ${listFieldLabels(orgMissing)}.`,
        completed: ORG_PROFILE_FIELDS.length - orgMissing.length,
        total: ORG_PROFILE_FIELDS.length,
        // Straight to the first pending field, the way the old per-field
        // shortcuts did.
        onComplete: () => onCompleteOrgProfile?.(orgMissing[0]?.key)
      });
    }

    return rows;
  }, [accountSetupDismissed, ownProfileMissing, orgMissing, onCompleteOwnProfile, onCompleteOrgProfile]);

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

    // The whole timeline, from the first sale to the last. Not a fixed lookback:
    // that opened the chart on empty columns before reaching any activity. The
    // chart component decides which slice of this is on screen.
    //
    // A month with no wins inside the range draws as a gap rather than
    // disappearing — collapsing it would put two non-adjacent months side by
    // side as if they followed each other.
    const realKeys = Object.keys(monthGroups).filter(k => k !== '9999-99').sort();
    const firstKey = realKeys[0];
    const anchorKey = realKeys[realKeys.length - 1];

    const sortedMonths = anchorKey
      ? monthRange(firstKey, anchorKey).map(m => {
          const group = monthGroups[m.monthKey];
          return (
            group || {
              monthKey: m.monthKey,
              monthName: m.monthName,
              monthShort: m.monthShort,
              totalAmount: 0,
              count: 0,
              deals: [] as typeof enrichedDeals
            }
          );
        })
      : Object.values(monthGroups).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

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

  // 1. Metric Computations
  // ---- Derived metrics. Every one of these comes from the data; where a
  // comparison isn't possible the KPI says so rather than showing a dash.

  const openOpps = useMemo(() => scopedOpps.filter(o => OPEN_STAGES.includes(o.stage)), [scopedOpps]);
  const openValue = useMemo(() => openOpps.reduce((s, o) => s + (o.value || 0), 0), [openOpps]);

  const stageBreakdown = useMemo(() => getStageBreakdown(scopedOpps), [scopedOpps]);
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
        <AccountSetupSection rows={setupRows} onDismiss={() => onDismissAccountSetup?.()} />

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

      {/* 3. Ganadas por mes — timeline navegable. Toda la lógica de ventana,
          selección y detalle vive en el componente. */}
      <WonByMonthChart
        months={wonData.sortedMonths}
        deals={wonData.allDeals}
        totalAmount={wonData.totalWonAmount}
        totalCount={wonData.totalWonCount}
        onSelectOpportunity={onSelectOpportunity}
      />

      {/* 5. El pipeline de un vistazo — cada tarjeta es un filtro.
          Fila propia y ancho completo: seis tarjetas de ancho igual no caben en
          una columna de la grilla que había acá. */}
      <PipelineStageCards
        openStages={activeStages}
        closedStages={closedStages}
        openCount={openOpps.length}
        openValue={openValue}
        onSelectStage={stage => goToOpportunities({ stage })}
        onViewAll={() => goToOpportunities()}
      />

      {/* 6. El equipo — solo para quien lo gestiona */}
      {canSeeTeam && repPerformance.length > 0 && (
        <TeamPerformancePanel
          reps={repPerformance}
          memberCount={orgUsers.length}
          onManageTeam={() => onNavigate?.('users')}
          onSelectRep={rep => goToOpportunities({ rep })}
        />
      )}

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
