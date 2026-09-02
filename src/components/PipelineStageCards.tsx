import React from 'react';
import { StageKey } from '../types';
import { formatMoney } from '../data/initialData';

interface StageSummary {
  key: StageKey;
  label: string;
  color: string;
  count: number;
  value: number;
}

interface PipelineStageCardsProps {
  /** Nuevo, Contactado, Calificado, Negociación — already split by the caller. */
  openStages: StageSummary[];
  /** Ganado, Perdido. */
  closedStages: StageSummary[];
  /**
   * The open total for the subtitle. Only the open stages on purpose: the
   * "Pipeline abierto" KPI higher up the same page shows this figure, and two
   * different numbers for what looks like the same thing on one screen is worse
   * than a smaller total.
   */
  openCount: number;
  openValue: number;
  onSelectStage: (stage: StageKey) => void;
  onViewAll: () => void;
}

/**
 * The pipeline at a glance: one card per stage, read left to right as a funnel.
 *
 * Replaced a vertical list of proportional bars. The bars encoded the same count
 * twice — as a number and as a width — and the width was only meaningful
 * relative to the busiest stage, which is not a question anybody asks.
 *
 * The cards are clickable, like the rows they replace: every number on this
 * dashboard leads to the list that produced it.
 */
export const PipelineStageCards: React.FC<PipelineStageCardsProps> = ({
  openStages,
  closedStages,
  openCount,
  openValue,
  onSelectStage,
  onViewAll
}) => {
  const renderCard = (stage: StageSummary) => (
    <button
      type="button"
      key={stage.key}
      id={`pipeline-card-${stage.key}`}
      className="pipeline-card"
      onClick={() => onSelectStage(stage.key)}
      title={`Ver las oportunidades en ${stage.label}`}
    >
      {/* The stage's colour, the same one the badges and the stage selector use. */}
      <span className="pipeline-card-accent" style={{ background: stage.color }} aria-hidden="true" />
      <span className="pipeline-card-stage">{stage.label}</span>
      <span className="pipeline-card-count">{stage.count}</span>
      <span className="pipeline-card-unit">
        {stage.count === 1 ? 'oportunidad' : 'oportunidades'}
      </span>
      <span className="pipeline-card-value">{formatMoney(stage.value)}</span>
    </button>
  );

  return (
    <div className="pipeline-section" id="card-pipeline-stages">
      <div className="pipeline-head">
        <div className="pipeline-head-text">
          <h3 className="pipeline-title">Pipeline</h3>
          <p className="pipeline-subtitle" id="pipeline-subtitle">
            {openCount} {openCount === 1 ? 'oportunidad' : 'oportunidades'} &middot;{' '}
            {formatMoney(openValue)} MXN
          </p>
        </div>

        <button
          type="button"
          id="btn-pipeline-view-all"
          className="btn btn-secondary btn-sm"
          onClick={onViewAll}
        >
          Ver oportunidades
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="pipeline-grid" id="pipeline-stage-cards">
        {openStages.map(renderCard)}

        {/* Where the pipeline ends and the outcome begins. Its own grid column,
            so the six cards stay equal width. */}
        <span className="pipeline-split" aria-hidden="true" />

        {closedStages.map(renderCard)}
      </div>
    </div>
  );
};
