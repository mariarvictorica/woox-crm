import React, { useState, useEffect } from 'react';
import { UserMember } from '../types';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { UserFormFields, UserFormValues } from './UserFormFields';
import { splitPhone } from '../data/initialData';

interface EditUserDrawerProps {
  isOpen: boolean;
  user: UserMember;
  onClose: () => void;
  onSave: (updatedUser: UserMember) => void;
  onShowToast?: (msg: string) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * The same "edit a user's profile" form used by the Org Manager
 * (UserDetailView) and by the Super Admin from a tenant's Usuarios tab.
 */
export const EditUserDrawer: React.FC<EditUserDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  onShowToast
}) => {
  const [values, setValues] = useState<UserFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const { code, number } = splitPhone(user.phone || '');
    setValues({
      firstName: user.firstName || user.name.split(' ')[0] || '',
      lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      role: user.role || 'Rep',
      position: user.position || '',
      countryCode: code,
      phone: number,
      avatarUrl: user.avatarUrl || ''
    });
    setErrors({});
    setTouched({});
    setShowDiscard(false);
  }, [isOpen, user]);

  const validateField = (field: string, v: UserFormValues): string => {
    switch (field) {
      case 'firstName':
        return v.firstName.trim() ? '' : 'Escribí el nombre';
      case 'lastName':
        return v.lastName.trim() ? '' : 'Escribí el apellido';
      case 'email':
        if (!v.email.trim()) return 'Escribí el correo electrónico';
        return EMAIL_RE.test(v.email.trim()) ? '' : 'Revisá el formato del correo';
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

  // Compared against the incoming user, so merely opening isn't "dirty".
  const isDirty = (() => {
    const { code, number } = splitPhone(user.phone || '');
    return (
      values.firstName !== (user.firstName || user.name.split(' ')[0] || '') ||
      values.lastName !== (user.lastName || user.name.split(' ').slice(1).join(' ') || '') ||
      values.email !== (user.email || '') ||
      values.role !== (user.role || 'Rep') ||
      values.position !== (user.position || '') ||
      values.countryCode !== code ||
      values.phone !== number ||
      values.avatarUrl !== (user.avatarUrl || '')
    );
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {
      firstName: validateField('firstName', values),
      lastName: validateField('lastName', values),
      email: validateField('email', values),
      phone: validateField('phone', values)
    };

    const order = ['firstName', 'lastName', 'email', 'phone'];
    const firstBad = order.find(k => nextErrors[k]);
    if (firstBad) {
      setErrors(nextErrors);
      setTouched({ firstName: true, lastName: true, email: true, phone: true });
      requestAnimationFrame(() =>
        document.getElementById(`edit-user-${firstBad === 'firstName' ? 'firstname' : firstBad === 'lastName' ? 'lastname' : firstBad}`)?.focus()
      );
      return;
    }

    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    const initials =
      `${values.firstName.trim()[0] || ''}${values.lastName.trim()[0] || ''}`.toUpperCase() || 'U';

    onSave({
      ...user,
      name: fullName,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      position: values.position.trim() || undefined,
      phone: values.phone.trim() ? `${values.countryCode} ${values.phone.trim()}` : undefined,
      initials,
      avatarUrl: values.avatarUrl.trim() || undefined
    });

    onClose();
    if (onShowToast) onShowToast(`Usuario ${fullName} actualizado con éxito`);
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        variant="drawer"
        id="user-edit-drawer"
        title="Editar usuario"
        subtitle="Datos personales, nivel de acceso y contacto."
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={onClose}
        onSubmit={handleSubmit}
        formId="form-user-edit-screen"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => (isDirty ? setShowDiscard(true) : onClose())}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-user-screen">
              Guardar cambios
            </button>
          </>
        }
      >
        <UserFormFields
          values={values}
          errors={errors}
          touched={touched}
          onChange={handleChange}
          onBlur={handleBlur}
          idPrefix="edit-user"
          fallbackInitials={user.initials}
          fallbackAvatarBg={user.avatarBg}
        />
      </Dialog>

      <ConfirmDialog
        isOpen={showDiscard}
        tone="warn"
        title="¿Descartar los cambios?"
        body="Modificaste datos que todavía no se guardaron. Si salís ahora, se pierden."
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
