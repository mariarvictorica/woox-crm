import React, { useRef } from 'react';
import { UserAvatar } from './UserAvatar';
import { FormField } from './FormField';
import { COUNTRY_CODES, USER_ROLES_LIST } from '../data/initialData';

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position: string;
  countryCode: string;
  phone: string;
  avatarUrl: string;
}

interface UserFormFieldsProps {
  values: UserFormValues;
  errors: Record<string, string>;
  /** Which fields the user has left, so errors only show once earned. */
  touched: Record<string, boolean>;
  onChange: (field: keyof UserFormValues, value: string) => void;
  onBlur: (field: keyof UserFormValues) => void;
  /** Prefix for DOM ids, so two instances never collide. */
  idPrefix: string;
  /** Fallback initials/colour for the avatar preview when editing. */
  fallbackInitials?: string;
  fallbackAvatarBg?: string;
  /**
   * Off when someone is editing their own profile: a person cannot grant
   * themselves a different level of access, so the control has no business
   * being on screen. Defaults on, leaving every admin-side caller unchanged.
   */
  showRolePicker?: boolean;
}

/**
 * The user form, shared by "Invitar usuario" and "Editar perfil de usuario".
 *
 * Both dialogs collected the same eight fields with the same rules, so the
 * role picker, avatar uploader and phone control lived twice and had already
 * drifted — users got a plain phone input while contacts and organizations got
 * the country-code combo.
 */
export const UserFormFields: React.FC<UserFormFieldsProps> = ({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  idPrefix,
  fallbackInitials,
  fallbackAvatarBg,
  showRolePicker = true
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const derivedInitials =
    `${values.firstName ? values.firstName.trim()[0] : ''}${
      values.lastName ? values.lastName.trim()[0] : ''
    }`.toUpperCase() ||
    fallbackInitials ||
    'U';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onChange('avatarUrl', values.avatarUrl); // no-op; error surfaced by caller
      return;
    }
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange('avatarUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const err = (field: keyof UserFormValues) => (touched[field] ? errors[field] : '');

  return (
    <>
      {/* Who they are — required to create the account at all. */}
      <div className="field-row">
        <FormField label="Nombre" htmlFor={`${idPrefix}-firstname`} required error={err('firstName')}>
          <input
            type="text"
            id={`${idPrefix}-firstname`}
            data-autofocus
            placeholder="Ej. Carlos"
            value={values.firstName}
            onChange={e => onChange('firstName', e.target.value)}
            onBlur={() => onBlur('firstName')}
          />
        </FormField>

        <FormField label="Apellido" htmlFor={`${idPrefix}-lastname`} required error={err('lastName')}>
          <input
            type="text"
            id={`${idPrefix}-lastname`}
            placeholder="Ej. Ramírez"
            value={values.lastName}
            onChange={e => onChange('lastName', e.target.value)}
            onBlur={() => onBlur('lastName')}
          />
        </FormField>
      </div>

      <FormField
        label="Correo electrónico"
        htmlFor={`${idPrefix}-email`}
        required
        hint="Con este correo inicia sesión."
        error={err('email')}
      >
        <input
          type="email"
          inputMode="email"
          id={`${idPrefix}-email`}
          placeholder="ejemplo@woox.mx"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          onBlur={() => onBlur('email')}
        />
      </FormField>

      {showRolePicker && (
      <FormField label="Nivel de acceso" required error={err('role')}>
        <div className="role-picker" role="radiogroup" aria-label="Nivel de acceso">
          {USER_ROLES_LIST.map(r => {
            const isSelected = values.role === r.value;
            const isManager = r.value === 'Manager';
            return (
              <button
                key={r.value}
                type="button"
                id={`${idPrefix}-role-${r.value.toLowerCase()}`}
                role="radio"
                aria-checked={isSelected}
                className={`role-card ${isSelected ? 'active' : ''} ${isManager ? 'is-manager' : ''}`}
                onClick={() => onChange('role', r.value)}
              >
                <span className="role-card-head">
                  <span className="role-card-name">{r.label}</span>
                  {isSelected && (
                    <span className="role-card-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="role-card-desc">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </FormField>
      )}

      {/* Everything below is optional and never blocks the task. */}
      <div className="field-section">
        <div className="field-section-label">Datos adicionales</div>

        <div className="field-row">
          <FormField label="Puesto" htmlFor={`${idPrefix}-position`}>
            <input
              type="text"
              id={`${idPrefix}-position`}
              placeholder="Ej. Asesor Comercial Sr."
              value={values.position}
              onChange={e => onChange('position', e.target.value)}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor={`${idPrefix}-phone`} error={err('phone')}>
            <div className="phone-input-combo">
              <select
                id={`${idPrefix}-countrycode`}
                aria-label="Código de país"
                className="phone-country-select"
                value={values.countryCode}
                onChange={e => onChange('countryCode', e.target.value)}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="tel"
                id={`${idPrefix}-phone`}
                className="phone-number-input"
                placeholder="Ej. 871 123 4567"
                value={values.phone}
                onChange={e => onChange('phone', e.target.value)}
                onBlur={() => onBlur('phone')}
              />
            </div>
          </FormField>
        </div>

        <FormField label="Foto de perfil" hint="JPG, PNG o WebP, hasta 5MB.">
          <div className="avatar-upload-row">
            <UserAvatar
              name={`${values.firstName} ${values.lastName}`.trim() || 'Usuario'}
              avatarUrl={values.avatarUrl}
              initials={derivedInitials}
              avatarBg={fallbackAvatarBg || 'var(--graphite)'}
              size="2xl"
            />
            <div className="avatar-upload-actions">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {values.avatarUrl ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {values.avatarUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    onChange('avatarUrl', '');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{ color: 'var(--crit)' }}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        </FormField>
      </div>
    </>
  );
};
