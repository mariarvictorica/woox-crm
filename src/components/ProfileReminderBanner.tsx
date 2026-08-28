import React, { useEffect, useRef, useState } from 'react';
import { UserProfileField } from '../data/initialData';

/** Long enough to read as a movement, short enough not to delay the click. */
const DISMISS_MS = 200;

interface ProfileReminderBannerProps {
  missing: UserProfileField[];
  onComplete: () => void;
  /** Called once the exit transition has run. Permanent: the notice does not
   *  come back after this. */
  onDismiss: () => void;
}

/** "puesto, teléfono y foto de perfil" — the labels read as a sentence, so no
 *  per-field grammar is needed. */
const listFields = (fields: UserProfileField[]): string => {
  const labels = fields.map(f => f.label.toLowerCase());
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
};

/**
 * The Dashboard nudge for a profile with optional fields left empty.
 *
 * Names the pending fields instead of charting them. It replaced a progress bar
 * that stretched the width of the page to say what "0/3" already said, and that
 * at zero was just an empty rail. With three items the useful question is "what
 * do I owe", not "how far along am I".
 *
 * Amber as a left accent rather than a full wash: the organization profile
 * notice directly above it is already an amber block, and two of them stacked
 * would flatten the difference between what the company needs to operate and a
 * personal detail.
 *
 * Its own component with its own visibility rule — deliberately not folded into
 * the attention queue or any system notice.
 */
export const ProfileReminderBanner: React.FC<ProfileReminderBannerProps> = ({
  missing, onComplete, onDismiss
}) => {
  const [dismissing, setDismissing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (missing.length === 0) return null;

  // Unmounting is the parent's call, so the exit has to finish before it is
  // asked for — otherwise the node is gone before the transition starts.
  const handleDismiss = () => {
    if (dismissing) return;
    setDismissing(true);
    timeoutRef.current = window.setTimeout(onDismiss, DISMISS_MS);
  };

  return (
    <div
      className={`profile-reminder-banner ${dismissing ? 'is-dismissing' : ''}`}
      id="profile-reminder"
      aria-hidden={dismissing}
    >
      <span aria-hidden="true" className="profile-reminder-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </span>

      <div className="profile-reminder-text">
        <span className="profile-reminder-title">Tu perfil está incompleto</span>
        <span className="profile-reminder-detail">
          Agregá tu {listFields(missing)} para que el equipo te reconozca en la actividad.
        </span>
      </div>

      <button
        type="button"
        id="btn-complete-own-profile"
        className="btn btn-primary btn-sm"
        onClick={onComplete}
      >
        Completar perfil
      </button>

      <button
        type="button"
        id="btn-dismiss-profile-reminder"
        className="profile-reminder-dismiss"
        onClick={handleDismiss}
        aria-label="No volver a recordarme"
        title="No volver a recordarme"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
