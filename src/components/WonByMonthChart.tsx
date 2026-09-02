import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { formatMoney } from '../data/initialData';
import { UserAvatar } from './UserAvatar';

export interface WonMonth {
  monthKey: string;
  monthName: string;
  monthShort: string;
  totalAmount: number;
  count: number;
}

export interface WonDeal {
  id: number;
  name: string;
  value: number;
  contactName: string;
  company?: string;
  rep: string;
  closeDateFormatted: string;
  monthKey: string;
}

interface WonByMonthChartProps {
  /** The full timeline, oldest first: every month from the first sale to the
   *  last, gaps included. The component decides which slice is on screen. */
  months: WonMonth[];
  /** Every won deal. The list below shows those of the selected month. */
  deals: WonDeal[];
  /** Historical totals for the badge — deliberately not the visible window, so
   *  the figure does not move as the user scrolls. */
  totalAmount: number;
  totalCount: number;
  onSelectOpportunity?: (id: number) => void;
}

/** Roughly the width a bar plus its label needs to stay legible. */
const MIN_MONTH_WIDTH = 118;
const MAX_VISIBLE = 6;
const MIN_VISIBLE = 3;

/** Horizontal wheel travel that counts as one month. */
const WHEEL_STEP = 40;

/**
 * A round ceiling just above `value`, for the Y axis.
 *
 * Recharts' own "nice" rounding is too coarse here: every month in the data
 * falls between 58k and 91k, so it picked 100k for every window and the axis
 * looked frozen. Following the window's own maximum is the point — a quiet
 * stretch has to be readable on its own scale.
 */
const niceCeiling = (value: number): number => {
  if (value <= 0) return 1000;
  // The magnitude comes from the value itself, not from the padded figure:
  // padding 91.3k first pushed it past 100k, whose round step is 50k, and the
  // axis ended at 150k with the tallest bar filling two thirds of the plot.
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const step = magnitude / 2;
  return Math.ceil((value * 1.08) / step) * step;
};

/**
 * Won deals by month, with a scrollable timeline.
 *
 * Three things drove the redesign. The axis used to start a fixed number of
 * months back, so it opened on empty columns before reaching any activity.
 * There was no way to look further back than what fitted on screen. And picking
 * a month to inspect needed a dropdown, even though the bars were already
 * clickable.
 *
 * Now the timeline runs from the first sale to the last, the window sits at the
 * recent end, and moving back is arrows, a horizontal wheel or a drag. There is
 * nothing to the right of the latest month, so that direction stops.
 *
 * The wheel deliberately reads only horizontal travel: taking over vertical
 * scroll would trap the page whenever the pointer crossed the chart.
 */
export const WonByMonthChart: React.FC<WonByMonthChartProps> = ({
  months,
  deals,
  totalAmount,
  totalCount,
  onSelectOpportunity
}) => {
  /** How many months back from the right edge the window has been moved. */
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(MAX_VISIBLE);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const wheelAcc = useRef(0);
  const drag = useRef<{ x: number; acc: number } | null>(null);

  // How many months fit is a question about the container, not the viewport:
  // collapsing the sidebar changes the width without changing the breakpoint.
  useEffect(() => {
    const el = chartRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const usable = el.clientWidth - 56; // the Y axis gutter
      const fits = Math.floor(usable / MIN_MONTH_WIDTH);
      setVisible(Math.max(MIN_VISIBLE, Math.min(MAX_VISIBLE, fits || MIN_VISIBLE)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxOffset = Math.max(0, months.length - visible);

  // The window can be left dangling by a narrower container or by new data.
  useEffect(() => {
    setOffset(o => Math.min(o, maxOffset));
  }, [maxOffset]);

  /** The most recent month that actually has a sale. */
  const latestWithData = useMemo(() => {
    for (let i = months.length - 1; i >= 0; i--) {
      if (months[i].count > 0) return months[i].monthKey;
    }
    return months.length ? months[months.length - 1].monthKey : null;
  }, [months]);

  const activeKey = selectedKey && months.some(m => m.monthKey === selectedKey)
    ? selectedKey
    : latestWithData;

  const end = months.length - offset;
  const start = Math.max(0, end - visible);
  const windowMonths = months.slice(start, end);

  const canGoBack = start > 0;
  const canGoForward = offset > 0;

  const step = (delta: number) =>
    setOffset(o => Math.max(0, Math.min(maxOffset, o + delta)));

  const handleWheel = (e: React.WheelEvent) => {
    // Vertical travel belongs to the page. Only a horizontal gesture moves the
    // timeline, which is what a trackpad swipe produces.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    wheelAcc.current += e.deltaX;
    while (Math.abs(wheelAcc.current) >= WHEEL_STEP) {
      const dir = wheelAcc.current > 0 ? -1 : 1; // swiping left reveals older
      wheelAcc.current -= Math.sign(wheelAcc.current) * WHEEL_STEP;
      step(dir);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, acc: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    drag.current.acc += dx;
    const width = MIN_MONTH_WIDTH;
    while (Math.abs(drag.current.acc) >= width) {
      // Dragging right pulls older months into view, like moving paper.
      step(drag.current.acc > 0 ? 1 : -1);
      drag.current.acc -= Math.sign(drag.current.acc) * width;
    }
  };
  const endDrag = () => {
    drag.current = null;
  };

  const windowCeiling = useMemo(
    () => niceCeiling(Math.max(...windowMonths.map(m => m.totalAmount), 0)),
    [windowMonths]
  );

  const shownDeals = useMemo(
    () => (activeKey ? deals.filter(d => d.monthKey === activeKey) : deals),
    [deals, activeKey]
  );
  const activeMonth = months.find(m => m.monthKey === activeKey);

  return (
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
            <strong>{formatMoney(totalAmount)}</strong>
            <span>· {totalCount} {totalCount === 1 ? 'acuerdo' : 'acuerdos'}</span>
          </div>
        </div>
      </div>

      {months.length > 0 ? (
        <>
          <div
            className={`won-chart-scroller ${canGoBack ? 'can-back' : ''} ${
              canGoForward ? 'can-forward' : ''
            }`}
            id="won-chart-scroller"
          >
            {/* Only rendered when there is somewhere to go, so nothing takes up
                permanent space in a chart that fits. */}
            {canGoBack && (
              <button
                type="button"
                id="btn-won-chart-back"
                className="won-chart-nav prev"
                onClick={() => step(1)}
                aria-label="Ver meses anteriores"
                title="Ver meses anteriores"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {canGoForward && (
              <button
                type="button"
                id="btn-won-chart-forward"
                className="won-chart-nav next"
                onClick={() => step(-1)}
                aria-label="Ver meses más recientes"
                title="Ver meses más recientes"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            <div
              className="won-chart-container"
              id="won-barchart-container"
              ref={chartRef}
              onWheel={handleWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
            >
              <ResponsiveContainer width="100%" height="100%">
                {/* The Y axis has no fixed domain: it rescales to whatever the
                    window holds, so a quiet stretch is still readable. */}
                <BarChart data={windowMonths} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
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
                    domain={[0, windowCeiling]}
                    tick={{ fill: 'var(--graphite)', fontSize: 11 }}
                    tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--good-bg)', radius: 6 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as WonMonth;
                        return (
                          <div className="won-tooltip-box">
                            <div className="won-tooltip-header">{data.monthName}</div>
                            <div className="won-tooltip-stat">
                              <span>Monto cerrado:</span>
                              <strong>{formatMoney(data.totalAmount)}</strong>
                            </div>
                            <div className="won-tooltip-stat">
                              <span>Acuerdos ganados:</span>
                              <span>
                                {data.count} {data.count === 1 ? 'oportunidad' : 'oportunidades'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalAmount" radius={[6, 6, 0, 0]} maxBarSize={52}>
                    {windowMonths.map(entry => (
                      <Cell
                        key={entry.monthKey}
                        fill={
                          entry.monthKey === activeKey
                            ? 'var(--good-deep)'
                            : entry.monthKey === hoveredKey
                            ? 'var(--good-bright)'
                            : 'var(--good)'
                        }
                        cursor="pointer"
                        onClick={() => setSelectedKey(entry.monthKey)}
                        onMouseEnter={() => setHoveredKey(entry.monthKey)}
                        onMouseLeave={() => setHoveredKey(null)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="won-deals-breakdown" id="won-deals-breakdown-section">
            <div className="won-deals-section-head" id="won-deals-section-head">
              <h4>Detalle de acuerdos ganados y fechas</h4>
              {/* The dropdown that used to live here is gone: clicking a bar is
                  the same choice with one fewer step. This states which month
                  is being inspected. */}
              <span className="won-deals-month-label" id="won-deals-month-label">
                {activeMonth ? activeMonth.monthName : '—'}
                {activeMonth && activeMonth.count > 0 && (
                  <>
                    {' · '}
                    {activeMonth.count} {activeMonth.count === 1 ? 'acuerdo' : 'acuerdos'} (
                    {formatMoney(activeMonth.totalAmount)})
                  </>
                )}
              </span>
            </div>

            <div className="won-deals-list" id="won-deals-list-items" key={activeKey || 'none'}>
              {shownDeals.length > 0 ? (
                shownDeals.map(deal => (
                  <div key={deal.id} className="won-deal-row" id={`won-deal-item-${deal.id}`}>
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
                          <span>
                            {deal.contactName} {deal.company ? `— ${deal.company}` : ''}
                          </span>
                          <span>&middot;</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <UserAvatar name={deal.rep} size="xs" />
                            <span>{deal.rep}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="won-deal-right">
                      <div className="won-deal-value">+{formatMoney(deal.value)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="won-deals-empty" id="won-deals-empty-state">
                  No se registraron oportunidades ganadas en{' '}
                  <strong>{activeMonth ? activeMonth.monthName : 'este mes'}</strong>.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state" style={{ padding: '32px 16px', margin: 0 }}>
          <div className="empty-state-title">Aún no hay oportunidades ganadas</div>
          <div className="empty-state-desc">
            Las oportunidades marcadas como "Ganado" con su fecha estimada de cierre aparecerán aquí
            en el diagrama de barras mensual.
          </div>
        </div>
      )}
    </div>
  );
};
