import React, { useState, useEffect, useMemo } from 'react';
import { Organization, UserMember } from '../types';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';
import { SearchableSelect } from './SearchableSelect';
import { UserFormFields, UserFormValues } from './UserFormFields';
import { EMAIL_RE } from '../data/initialData';

interface InviteUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteUser: (newUser: UserMember) => void;
  onShowToast?: (msg: string) => void;
  // Which tenant the new user belongs to. Defaults to WooX so the Manager's
  // existing "Invitar usuario" flow is unchanged; the Super Admin passes the
  // organization being viewed when adding a user from Organizaciones.
  organizationName?: string;
  /**
   * Set from the platform-wide "Usuarios" tab, where the Super Admin isn't
   * standing inside any organization: the drawer then asks which organization
   * to link the user to before anything else, and won't submit without one.
   * Left off everywhere the organization is already known (Org Details),
   * so that flow keeps passing `organizationName` and is untouched.
   */
  requireOrganizationSelect?: boolean;
  /** Options for that picker. Only read when requireOrganizationSelect is set. */
  organizations?: Organization[];
  /**
   * Everyone already on the platform, so the same address can't be invited
   * twice. Checked globally rather than per organization because the email is
   * the login identity, not a per-tenant label.
   */
  existingUsers?: UserMember[];
}

const emptyValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'Rep',
  position: '',
  countryCode: '+52',
  phone: '',
  avatarUrl: ''
};

export const InviteUserDrawer: React.FC<InviteUserDrawerProps> = ({
  isOpen,
  onClose,
  onInviteUser,
  onShowToast,
  organizationName,
  requireOrganizationSelect = false,
  organizations = [],
  existingUsers = []
}) => {
  const [values, setValues] = useState<UserFormValues>(emptyValues);
  // Only meaningful when requireOrganizationSelect is set; '' = nothing picked yet.
  const [selectedOrg, setSelectedOrg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValues(emptyValues);
    setSelectedOrg('');
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setShowDiscard(false);
  }, [isOpen]);

  const orgOptions = useMemo(
    () =>
      organizations
        .map(o => ({ value: o.name, label: o.name }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [organizations]
  );

  const validateField = (field: string, v: UserFormValues): string => {
    switch (field) {
      case 'firstName':
        return v.firstName.trim() ? '' : 'Escribí el nombre';
      case 'lastName':
        return v.lastName.trim() ? '' : 'Escribí el apellido';
      case 'email': {
        const email = v.email.trim().toLowerCase();
        if (!email) return 'Escribí el correo electrónico';
        if (!EMAIL_RE.test(email)) return 'Revisá el formato del correo';
        if (existingUsers.some(u => u.email.trim().toLowerCase() === email)) {
          return 'Ya existe un usuario con este correo';
        }
        return '';
      }
      case 'phone':
        if (!v.phone.trim()) return '';
        return v.phone.replace(/\D/g, '').length >= 7 ? '' : 'El teléfono necesita al menos 7 dígitos';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof UserFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field: keyof UserFormValues) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, values) }));
  };

  const isDirty = Boolean(
    (requireOrganizationSelect && selectedOrg) ||
      values.firstName.trim() ||
      values.lastName.trim() ||
      values.email.trim() ||
      values.position.trim() ||
      values.phone.trim() ||
      values.avatarUrl.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {
      organization: requireOrganizationSelect
        ? selectedOrg
          ? ''
          : 'Elegí a qué organización se vincula'
        : organizationName
          ? ''
          : 'No pudimos determinar tu organización',
      firstName: validateField('firstName', values),
      lastName: validateField('lastName', values),
      email: validateField('email', values),
      phone: validateField('phone', values)
    };

    const order = ['organization', 'firstName', 'lastName', 'email', 'phone'];
    const firstBad = order.find(k => nextErrors[k]);
    if (firstBad) {
      setErrors(nextErrors);
      setTouched({ organization: true, firstName: true, lastName: true, email: true, phone: true });
      if (firstBad !== 'organization') {
        requestAnimationFrame(() =>
          document.getElementById(`invite-user-${firstBad === 'firstName' ? 'firstname' : firstBad === 'lastName' ? 'lastname' : firstBad}`)?.focus()
        );
      }
      return;
    }

    setIsSubmitting(true);

    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    const initials =
      `${values.firstName.trim()[0] || ''}${values.lastName.trim()[0] || ''}`.toUpperCase() || 'U';

    const newUser: UserMember = {
      id: Date.now(),
      name: fullName,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      organization: requireOrganizationSelect ? selectedOrg : organizationName,
      position: values.position.trim() || undefined,
      phone: values.phone.trim() ? `${values.countryCode} ${values.phone.trim()}` : undefined,
      status: 'Invitado',
      lastAccess: 'Pendiente de activación',
      initials,
      avatarBg: 'var(--graphite)',
      avatarUrl: values.avatarUrl.trim() || undefined
    };

    setTimeout(() => {
      onInviteUser(newUser);
      setIsSubmitting(false);
      onClose();
      if (onShowToast) {
        onShowToast(`Invitación enviada a ${newUser.email}`);
      }
    }, 200);
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        variant="drawer"
        id="invite-user-drawer-panel"
        title="Invitar usuario"
        subtitle="Le llega un correo para activar su cuenta."
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={onClose}
        onSubmit={handleSubmit}
        formId="invite-user-form"
        footer={
          <>
            <button
              type="button"
              id="btn-cancel-invite-drawer"
              className="btn btn-ghost"
              onClick={() => (isDirty ? setShowDiscard(true) : onClose())}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-invite-drawer"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  Enviando…
                </>
              ) : (
                'Enviar invitación'
              )}
            </button>
          </>
        }
      >
        {requireOrganizationSelect && (
          <FormField
            label="Organización"
            required
            hint="El usuario queda dado de alta dentro de esta organización."
            error={touched.organization ? errors.organization : ''}
          >
            <SearchableSelect
              options={orgOptions}
              value={selectedOrg}
              onChange={org => {
                setSelectedOrg(org);
                if (errors.organization) setErrors(prev => ({ ...prev, organization: '' }));
              }}
              allLabel="Seleccioná una organización"
              ariaLabel="Organización a la que se vincula el usuario"
            />
          </FormField>
        )}

        <UserFormFields
          values={values}
          errors={errors}
          touched={touched}
          onChange={handleChange}
          onBlur={handleBlur}
          idPrefix="invite-user"
        />
      </Dialog>

      <ConfirmDialog
        isOpen={showDiscard}
        tone="warn"
        title="¿Descartar esta invitación?"
        body="Escribiste datos que todavía no se enviaron. Si salís ahora, se pierden."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onCancel={() => setShowDiscard(false)}
        onConfirm={() => {
          setShowDiscard(false);
          onClose();
        }}
      />
    </>
  );
};
