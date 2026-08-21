import React from 'react';

interface FormFieldProps {
  /** Persistent, real label — never a placeholder standing in for one. */
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Helper copy shown under the control when there's no error. */
  hint?: string;
  /** Field-level error. Space for one line is always reserved, so showing an
   *  error never shifts the layout around the user. */
  error?: string;
  /** Read-only/derived content: shows neither "*" nor "(opcional)", since
   *  neither is true of a value the user can't set here. */
  readOnly?: boolean;
  children: React.ReactNode;
}

/**
 * The single form-field pattern for the whole app.
 *
 * Replaces three divergent systems (.form-group-field at 13px label / 14.5px
 * input, .drawer-form-field and .form-row both at 11.5px uppercase label /
 * 13.5px input), which meant the same field rendered differently depending on
 * which dialog showed it.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  readOnly = false,
  children
}) => {
  return (
    <div className={`field-group ${error ? 'has-error' : ''}`}>
      <label className="field-label" htmlFor={htmlFor}>
        <span className="field-label-text">{label}</span>
        {readOnly ? null : required ? (
          <span className="field-req" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="field-opt">(opcional)</span>
        )}
      </label>

      {children}

      {/* Reserved line: error replaces hint in place, no reflow. */}
      <div className="field-message" role={error ? 'alert' : undefined}>
        {error ? (
          <span className="field-error">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </span>
        ) : hint ? (
          <span className="field-hint">{hint}</span>
        ) : null}
      </div>
    </div>
  );
};
