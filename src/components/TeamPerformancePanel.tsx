import React from 'react';
import { UserAvatar } from './UserAvatar';
import { RepPerformance, formatMoney } from '../data/initialData';

interface TeamPerformancePanelProps {
  reps: RepPerformance[];
  /** Head count line: total members and how many are representatives. */
  memberCount: number;
  onManageTeam: () => void;
  /** Opens Oportunidades filtered to that representative. */
  onSelectRep: (repName: string) => void;
}

/**
 * How the sales team is doing, one row per representative.
 *
 * Sorted by open pipeline so the row order itself carries meaning, and a rep
 * with no open opportunities is marked — that absence is the only team signal
 * this data can support honestly, and it is the one worth acting on.
 */
export const TeamPerformancePanel: React.FC<TeamPerformancePanelProps> = ({
  reps,
  memberCount,
  onManageTeam,
  onSelectRep
}) => (
  <div className="manager-card" id="card-team-performance">
    <div className="manager-card-head">
      <h3>Rendimiento del equipo</h3>
      <span className="head-meta">
        {memberCount} {memberCount === 1 ? 'integrante' : 'integrantes'} &middot;{' '}
        {reps.length} {reps.length === 1 ? 'representante' : 'representantes'}
      </span>
    </div>

    <div id="team-rep-list">
      {reps.map(rep => (
        <button
          key={rep.name}
          type="button"
          id={`team-rep-${rep.name.replace(/\s+/g, '-').toLowerCase()}`}
          className={`team-rep-row ${rep.openCount === 0 ? 'is-idle' : ''}`}
          onClick={() => onSelectRep(rep.name)}
          title={`Ver las oportunidades de ${rep.name}`}
        >
          <span className="team-rep-who">
            <UserAvatar name={rep.name} size="md" />
            <span className="team-rep-name">{rep.name}</span>
          </span>

          <span className="team-rep-metrics">
            <span className="team-rep-metric">
              <b>{rep.openCount}</b> {rep.openCount === 1 ? 'abierta' : 'abiertas'}
            </span>
            <span className="team-rep-metric">
              <b>{formatMoney(rep.openValue)}</b> en pipeline
            </span>
            <span className="team-rep-metric">
              <b>{rep.wonCount}</b> {rep.wonCount === 1 ? 'ganada' : 'ganadas'}
            </span>
            <span className="team-rep-metric">
              {/* Null rather than 0% when nothing has closed: a rate over no
                  deals would read as terrible performance instead of no data. */}
              <b>{rep.winRate === null ? '—' : `${rep.winRate}%`}</b> cierre
            </span>
          </span>

          {rep.openCount === 0 && <span className="team-rep-flag">Sin pipeline</span>}
        </button>
      ))}
    </div>

    <button
      type="button"
      id="btn-team-manage"
      className="btn btn-secondary btn-sm"
      onClick={onManageTeam}
      style={{ marginTop: '14px' }}
    >
      Gestionar usuarios
    </button>
  </div>
);
