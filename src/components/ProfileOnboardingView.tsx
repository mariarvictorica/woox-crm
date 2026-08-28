import React, { useState } from 'react';
import { UserMember } from '../types';
import { UserFormFields, UserFormValues } from './UserFormFields';
import {
  COUNTRY_CODES,
  USER_PROFILE_FIELDS,
  getUserMissingFields,
  joinPhone,
  splitPhone
} from '../data/initialData';
import { OrgProfileProgressBar } from './OrgProfileProgressBar';

interface ProfileOnboardingViewProps {
  user: UserMember;
  /** The finished profile. Also marks the account as having entered. */
  onComplete: (updated: UserMember) => void;
  /** Leaves the profile as it is and lets them in; the Dashboard picks the
   *  nudge up from there. */
  onSkip: () => void;
  /** The Sidebar that normally holds this lives inside the session gate, and
   *  this screen replaces it — without its own way out, someone who does not
   *  want to fill this in would be stuck. */
  onLogout: () => void;
  onShowToast?: (msg: string) => void;
  /**
   * Demo tooling: this is a replay, not a real first sign-in. The form starts
   * empty even when the account is complete — otherwise a demo of the step
   * opens on a filled-in form, which shows nothing — and nothing is saved.
   */
  simulated?: boolean;
}

/**
 * The step a new user goes through on their first sign-in.
 *
 * Puesto, teléfono and foto are optional when an admin creates the account —
 * on purpose, so inviting somebody stays a ten-second job — which left every
 * invited user with a half-empty profile and no prompt to ever finish it.
 *
 * Full screen rather than a dialog: this replaces the app the way SignInView
 * does, which reads as "a step in getting in" instead of "a form you can
 * dismiss". Dialog could not express it anyway — it has no way to refuse to
 * close.
 *
 * Identical for every role. Nothing here depends on what the person is
 * allowed to do, so splitting the copy would only add drift.
 */
export const ProfileOnboardingView: React.FC<ProfileOnboardingViewProps> = ({
  user,
  onComplete,
  onSkip,
  onLogout,
  onShowToast,
  simulated = false
}) => {
  const initialPhone = splitPhone(simulated ? '' : user.phone || '');

  const [values, setValues] = useState<UserFormValues>({
    firstName: user.firstName || user.name.split(' ')[0] || '',
    lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    role: user.role || 'Rep',
    position: simulated ? '' : user.position || '',
    countryCode: initialPhone.code || COUNTRY_CODES[0].code,
    phone: initialPhone.number,
    avatarUrl: simulated ? '' : user.avatarUrl || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /** Only the phone can be filled in wrongly — the other two are free text and
   *  a file. Nothing here is required: the photo falls back to initials, and a
   *  blank field is the state we started from. */
  const validatePhone = (v: UserFormValues): string => {
    if (!v.phone.trim()) return '';
    return v.phone.replace(/\D/g, '').length >= 7 ? '' : 'El teléfono necesita al menos 7 dígitos';
  };

  const handleChange = (field: keyof UserFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field: keyof UserFormValues) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'phone') setErrors(prev => ({ ...prev, phone: validatePhone(values) }));
  };

  const buildUpdated = (): UserMember => ({
    ...user,
    position: values.position.trim() || undefined,
    phone: joinPhone(values.countryCode, values.phone),
    avatarUrl: values.avatarUrl.trim() || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneError = validatePhone(values);
    if (phoneError) {
      setErrors({ phone: phoneError });
      setTouched(prev => ({ ...prev, phone: true }));
      requestAnimationFrame(() => document.getElementById('onboarding-phone')?.focus());
      return;
    }

    onComplete(buildUpdated());
    onShowToast?.(simulated ? 'Simulación terminada · no se guardó nada' : 'Tu perfil quedó listo');
  };

  // Counts what they have filled in so far, not what the record started with,
  // so the bar answers "how far along am I" while they are typing.
  const missing = getUserMissingFields(buildUpdated());
  const total = USER_PROFILE_FIELDS.length;

  return (
    <div className="signin-screen" id="view-profile-onboarding">
      <div className="signin-card onboarding-card">
        <div className="signin-brand">
          <span className="signin-logo" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <div>
            <div className="signin-brand-name">WooX CRM</div>
            <div className="signin-brand-sub">V1 · Prototipo</div>
          </div>
          <span
            className={`signin-role-tag ${simulated ? 'is-simulated' : ''}`}
            id="onboarding-role-tag"
          >
            {simulated ? 'Simulación · primer ingreso' : 'Primer ingreso'}
          </span>
        </div>

        <h1 className="signin-title">Hola, {values.firstName || user.name}</h1>
        <p className="signin-subtitle">
          Completá tu perfil para que tu equipo sepa quién sos y cómo contactarte. Podés dejar
          algo para después.
        </p>

        {simulated && (
          <p className="onboarding-simulated-note" id="onboarding-simulated-note">
            Modo demo: nada de lo que completes acá se guarda, y el perfil de{' '}
            {user.name} queda igual que antes.
          </p>
        )}

        <div className="onboarding-progress" id="onboarding-progress-row">
          <span className="onboarding-progress-count">
            {total - missing.length}/{total}
          </span>
          <OrgProfileProgressBar
            completed={total - missing.length}
            total={total}
            label="Progreso de tu perfil"
          />
        </div>

        <form id="form-profile-onboarding" onSubmit={handleSubmit} noValidate autoComplete="off">
          <UserFormFields
            values={values}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
            idPrefix="onboarding"
            showRolePicker={false}
            showIdentityFields={false}
            optionalSectionLabel="Tus datos"
            fallbackInitials={user.initials}
            fallbackAvatarBg={user.avatarBg}
          />

          <button type="submit" id="btn-onboarding-save" className="btn btn-primary signin-submit">
            Guardar y entrar
          </button>

          <button
            type="button"
            id="btn-onboarding-skip"
            className="btn btn-ghost btn-sm signin-link"
            onClick={onSkip}
          >
            Completar después
          </button>
        </form>
      </div>

      <button
        type="button"
        id="btn-onboarding-logout"
        className="signin-variant-btn"
        onClick={onLogout}
      >
        Cerrar sesión
      </button>
    </div>
  );
};
