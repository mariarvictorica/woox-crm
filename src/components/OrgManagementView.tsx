import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Organization, UserMember } from '../types';
import { FormField } from './FormField';
import { UserAvatar } from './UserAvatar';
import { OrgProfileProgressBar } from './OrgProfileProgressBar';
import {
  COUNTRY_CODES,
  EMAIL_RE,
  ORG_PROFILE_FIELDS,
  getOrgMissingFields,
  splitPhone
} from '../data/initialData';
import type { OrgProfileFieldKey } from '../data/initialData';

interface OrgManagementViewProps {
  organization: Organization;
  owner?: UserMember;
  /** Every organization on the platform, to keep names unique. */
  allOrganizations: Organization[];
  onUpdateOrganization: (updated: Organization) => void;
  /** Arriving from a specific shortcut in the Dashboard notice: land on that
   *  field instead of making the Owner hunt for it. */
  focusField?: OrgProfileFieldKey | null;
  /** Called once focusField has been consumed, so the caller can clear it and
   *  a later visit doesn't re-focus. */
  onFocusFieldHandled?: () => void;
}

interface OrgFormValues {
  name: string;
  tradeName: string;
  taxId: string;
  address: string;
  email: string;
  countryCode: string;
  phone: string;
  logoUrl: string;
}

const toForm = (org: Organization): OrgFormValues => {
  const { code, number } = splitPhone(org.phone || '');
  return {
    name: org.name || '',
    tradeName: org.tradeName || '',
    taxId: org.taxId || '',
    address: org.address || '',
    email: org.email || '',
    countryCode: code,
    phone: number,
    logoUrl: org.logoUrl || ''
  };
};

/**
 * The Owner's own view of their organization.
 *
 * Deliberately an always-editable page rather than the read-then-drawer shape
 * the Super Admin uses: this is "my data", and the whole point is that the
 * Owner arrives with fields the Super Admin left blank, so the gaps have to be
 * visible and fillable in one place.
 *
 * The Owner cannot reassign ownership here. Transferring it is a privileged
 * action that already has its own flow on the Super Admin side, and doing it
 * from this page would remove the page — and the nav item leading to it — in
 * the same render, with no way back.
 */
export const OrgManagementView: React.FC<OrgManagementViewProps> = ({
  organization,
  owner,
  allOrganizations,
  onUpdateOrganization,
  focusField,
  onFocusFieldHandled
}) => {
  const [form, setForm] = useState<OrgFormValues>(() => toForm(organization));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keyed on the id, not the object: re-hydrating on every organization change
  // would wipe whatever the Owner is typing. After a successful save the
  // handler re-syncs explicitly, which is also what clears the dirty state.
  useEffect(() => {
    setForm(toForm(organization));
    setErrors({});
  }, [organization.id]);

  // The logo has no input to focus — its control is the upload button.
  useEffect(() => {
    if (!focusField) return;
    const targetId =
      focusField === 'logoUrl' ? 'btn-org-logo-upload' : `org-mgmt-${focusField}`;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }
    onFocusFieldHandled?.();
    // Only re-run when the request changes; onFocusFieldHandled is a stable
    // clear-the-request callback, not part of the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusField]);

  const pristine = useMemo(() => toForm(organization), [organization]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(pristine);

  const missing = useMemo(() => getOrgMissingFields(organization), [organization]);

  const set = (field: keyof OrgFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'El archivo debe ser una imagen válida (JPG, PNG, WebP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'La imagen debe pesar menos de 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm(prev => ({ ...prev, logoUrl: reader.result as string }));
        setErrors(prev => ({ ...prev, logo: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: '' }));
    setErrors(prev => ({ ...prev, logo: '' }));
    // Without this the input keeps the same FileList, so re-picking the very
    // same file never fires onChange again.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};

    const name = form.name.trim();
    if (!name) {
      next.name = 'Escribí el nombre de la organización';
    } else if (
      allOrganizations.some(
        o => o.id !== organization.id && o.name.trim().toLowerCase() === name.toLowerCase()
      )
    ) {
      // Members are linked to their organization by name, so two organizations
      // sharing one would tangle both rosters.
      next.name = 'Ya existe otra organización con este nombre';
    }

    const email = form.email.trim();
    if (email && !EMAIL_RE.test(email)) {
      next.email = 'Revisá el formato del correo';
    }

    const phone = form.phone.trim();
    if (phone && phone.replace(/\D/g, '').length < 7) {
      next.phone = 'El teléfono necesita al menos 7 dígitos';
    }

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next = validate();
    const firstBad = ['name', 'email', 'phone'].find(k => next[k]);
    if (firstBad) {
      setErrors(prev => ({ ...prev, ...next }));
      requestAnimationFrame(() => document.getElementById(`org-mgmt-${firstBad}`)?.focus());
      return;
    }

    const payload: Organization = {
      ...organization,
      name: form.name.trim(),
      tradeName: form.tradeName.trim() || undefined,
      taxId: form.taxId.trim().toUpperCase() || undefined,
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() ? `${form.countryCode} ${form.phone.trim()}` : undefined,
      logoUrl: form.logoUrl || undefined
    };

    onUpdateOrganization(payload);
    // The parent replaces the object but keeps the id, so the hydrating effect
    // won't fire — reset here so the form stops reading as dirty.
    setForm(toForm(payload));
    setErrors({});
  };

  return (
    <section id="view-org-management" className="view active">
      <div className="page-head" id="org-management-head">
        <div>
          <h1>Mi organización</h1>
          <p>Datos de {organization.name}</p>
        </div>
        <div className="head-actions">
          {/* Same reading as the Dashboard notice, on the page that resolves
              it — so progress doesn't only exist somewhere the Owner has
              already left. No CTA here: this is where the work happens. */}
          <div
            id="org-profile-completeness"
            style={{ minWidth: '190px', display: 'flex', flexDirection: 'column', gap: '7px' }}
          >
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: missing.length ? 'var(--warn-ink)' : 'var(--good)'
              }}
            >
              {missing.length === 0 ? (
                'Datos completos'
              ) : (
                <>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                    {ORG_PROFILE_FIELDS.length - missing.length}/{ORG_PROFILE_FIELDS.length}
                  </span>{' '}
                  datos completados
                </>
              )}
            </span>
            <OrgProfileProgressBar
              completed={ORG_PROFILE_FIELDS.length - missing.length}
              total={ORG_PROFILE_FIELDS.length}
            />
          </div>
        </div>
      </div>

      {/* noValidate so our own messages run instead of the browser's native
          bubbles — same reason Dialog's form sets it. */}
      <form id="form-org-management" onSubmit={handleSubmit} noValidate autoComplete="off">
        <div
          className="card"
          style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <FormField
            label="Nombre de la organización"
            htmlFor="org-mgmt-name"
            required
            hint="Es el nombre con el que se identifica tu empresa en la plataforma."
            error={errors.name}
          >
            <input
              type="text"
              id="org-mgmt-name"
              autoComplete="off"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </FormField>

          <FormField
            label="Owner"
            readOnly
            hint="Solo el Super Admin puede transferir la propiedad de la organización."
          >
            {owner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <UserAvatar
                  name={owner.name}
                  avatarUrl={owner.avatarUrl}
                  initials={owner.initials}
                  avatarBg={owner.avatarBg}
                  size="md"
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{owner.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-500)' }}>{owner.email}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--ink-500)', padding: '4px 0' }}>
                No encontramos al usuario asignado como Owner
              </div>
            )}
          </FormField>

          <FormField label="Logo" hint="JPG, PNG o WebP, hasta 5MB." error={errors.logo}>
            <div className="avatar-upload-row">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={form.name || organization.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--r-lg)',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid var(--border)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {(form.name || organization.name).trim()[0]?.toUpperCase() || 'O'}
                </div>
              )}
              <div className="avatar-upload-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  id="btn-org-logo-upload"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {form.logoUrl && (
                  <button
                    type="button"
                    id="btn-org-logo-remove"
                    className="btn btn-ghost btn-sm"
                    onClick={removeLogo}
                    style={{ color: 'var(--crit)' }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </FormField>

          <div className="field-section">
            <div className="field-section-label">Datos fiscales y de contacto</div>

            <div className="field-row">
              <FormField label="Nombre comercial" htmlFor="org-mgmt-tradeName">
                <input
                  type="text"
                  id="org-mgmt-tradeName"
              autoComplete="off"
                  placeholder="Ej. WooX"
                  value={form.tradeName}
                  onChange={e => set('tradeName', e.target.value)}
                />
              </FormField>

              <FormField label="RFC" htmlFor="org-mgmt-taxId">
                <input
                  type="text"
                  id="org-mgmt-taxId"
              autoComplete="off"
                  placeholder="Ej. PBA010101AAA"
                  value={form.taxId}
                  onChange={e => set('taxId', e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Dirección" htmlFor="org-mgmt-address">
              <input
                type="text"
                id="org-mgmt-address"
              autoComplete="off"
                placeholder="Ej. Torreón, Coahuila"
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
            </FormField>

            <FormField
              label="Correo de la organización"
              htmlFor="org-mgmt-email"
              error={errors.email}
            >
              <input
                type="email"
                inputMode="email"
                id="org-mgmt-email"
              autoComplete="off"
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </FormField>

            <FormField label="Teléfono" htmlFor="org-mgmt-phone" error={errors.phone}>
              <div className="phone-input-combo">
                <select
                  id="org-mgmt-countrycode"
                  aria-label="Código de país"
                  className="phone-country-select"
                  value={form.countryCode}
                  onChange={e => set('countryCode', e.target.value)}
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
                  id="org-mgmt-phone"
              autoComplete="off"
                  className="phone-number-input"
                  placeholder="Ej. 871 123 4567"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
            </FormField>

            <FormField label="Alta en la plataforma" readOnly>
              <div style={{ fontSize: '13px', color: 'var(--ink-700)', padding: '4px 0' }}>
                {organization.createdAt}
              </div>
            </FormField>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '4px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)'
            }}
          >
            {isDirty && (
              <button
                type="button"
                id="btn-discard-org-changes"
                className="btn btn-ghost"
                onClick={() => {
                  setForm(pristine);
                  setErrors({});
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Descartar cambios
              </button>
            )}
            <button
              type="submit"
              id="btn-save-org-management"
              className="btn btn-primary"
              disabled={!isDirty}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
