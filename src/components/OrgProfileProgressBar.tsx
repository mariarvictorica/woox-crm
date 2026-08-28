import React from 'react';

interface OrgProfileProgressBarProps {
  completed: number;
  total: number;
  /** Set when something needs aria-controls to point here. */
  id?: string;
  /** What the bar is measuring. The organization profile is no longer the only
   *  caller, so the accessible name cannot be baked in. */
  label?: string;
}

/**
 * How far along the organization profile is. Shared by the Dashboard notice
 * and by "Mi organización" itself, so the two can't drift apart in either
 * their fill colour or their accessible values.
 *
 * Built on .stage-track/.stage-fill — the same bar the pipeline breakdown
 * uses — and on .stage-fill.won for the finished state, so completion reads
 * green the way a won opportunity does.
 */
export const OrgProfileProgressBar: React.FC<OrgProfileProgressBarProps> = ({
  completed,
  total,
  id,
  label = 'Progreso del perfil de la organización'
}) => {
  const isComplete = total > 0 && completed >= total;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      id={id}
      className="stage-track"
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label}
    >
      <div
        className={`stage-fill ${isComplete ? 'won' : ''}`}
        style={{ width: `${pct}%`, ...(isComplete ? {} : { background: 'var(--warn)' }) }}
      />
    </div>
  );
};
