import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';
import { COUNTRY_CODES } from '../data/initialData';

// The Owner isn't a plain field on Organization — it's a reference to a real
// UserMember. The form still just collects a name + email; App.tsx is
// responsible for turning that into an actual user record and an ownerId.
export interface NewOrganizationInput {
  name: string;
  ownerName: string;
  ownerEmail: string;
  tradeName?: string;
  taxId?: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface NewOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrganization: (input: NewOrganizationInput) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewOrganizationModal: React.FC<NewOrganizationModalProps> = ({
  isOpen,
  onClose,
  onCreateOrganization
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showOptional, setShowOptional] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setOwnerName('');
      setOwnerEmail('');
      setTradeName('');
      setTaxId('');
      setAddress('');
      setEmail('');
      setCountryCode('+52');
      setPhone('');
      setErrors({});
      setTouched({});
      setShowOptional(false);
      setShowDiscard(false);
    }
  }, [isOpen]);

  const isDirty = Boolean(
    name.trim() ||
      ownerName.trim() ||
      ownerEmail.trim() ||
      tradeName.trim() ||
      taxId.trim() ||
      address.trim() ||
      email.trim() ||
      phone.trim()
  );

  // One validator, used by both blur and submit, so the two can't disagree.
  const validateField = (field: string, value: string): string => {
    const v = value.trim();
    switch (field) {
      case 'name':
        return v ? '' : 'Escribí el nombre de la organización';
      case 'ownerName':
        return v ? '' : 'Escribí el nombre del Owner';
      case 'ownerEmail':
        if (!v) return 'Escribí el correo del Owner';
        return EMAIL_RE.test(v) ? '' : 'Revisá el formato del correo (ej. owner@empresa.com)';
      case 'email':
        // Optional: only complain if they typed something malformed.
        if (!v) return '';
        return EMAIL_RE.test(v) ? '' : 'Revisá el formato del correo';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  // Clear a field's error as soon as the user starts correcting it.
  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {
      name: validateField('name', name),
      ownerName: validateField('ownerName', ownerName),
      ownerEmail: validateField('ownerEmail', ownerEmail),
      email: validateField('email', email)
    };

    const firstBad = Object.keys(nextErrors).find(k => nextErrors[k]);
    if (firstBad) {
      setErrors(nextErrors);
      setTouched({ name: true, ownerName: true, ownerEmail: true, email: true });
      // Point at the offending field instead of making them re-scan the form.
      // Nothing they typed is cleared.
      if (firstBad === 'email') setShowOptional(true);
      requestAnimationFrame(() => {
        document.getElementById(`org-form-${firstBad}`)?.focus();
      });
      return;
    }

    onCreateOrganization({
      name: name.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      tradeName: tradeName.trim() || undefined,
      taxId: taxId.trim() || undefined,
      address: address.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() ? `${countryCode} ${phone.trim()}` : undefined
    });

    onClose();
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  return (
    <>
      <Dialog
        isOpen={isOpen}
        id="modal-org-card"
        title="Agregar organización"
        subtitle="Se crea la organización y se invita a su Owner."
        width="560px"
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={onClose}
        onSubmit={handleSubmit}
        formId="form-new-org"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => (isDirty ? setShowDiscard(true) : onClose())}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear organización
            </button>
          </>
        }
      >
        {/* Most important first: what the org is, and who runs it. */}
        <FormField label="Nombre de la organización" htmlFor="org-form-name" required error={err('name')}>
          <input
            type="text"
            id="org-form-name"
            data-autofocus
            placeholder="Ej. Pinturas del Bajío S.A. de C.V."
            value={name}
            onChange={e => {
              setName(e.target.value);
              clearError('name');
            }}
            onBlur={e => handleBlur('name', e.target.value)}
          />
        </FormField>

        <div className="field-section">
          <div className="field-section-label">Owner de la organización</div>

          <FormField label="Nombre" htmlFor="org-form-ownerName" required error={err('ownerName')}>
            <input
              type="text"
              id="org-form-ownerName"
              placeholder="Ej. María Fernanda López"
              value={ownerName}
              onChange={e => {
                setOwnerName(e.target.value);
                clearError('ownerName');
              }}
              onBlur={e => handleBlur('ownerName', e.target.value)}
            />
          </FormField>

          <FormField
            label="Correo"
            htmlFor="org-form-ownerEmail"
            required
            hint="Le llega la invitación para activar su cuenta."
            error={err('ownerEmail')}
          >
            <input
              type="email"
              id="org-form-ownerEmail"
              placeholder="owner@empresa.com"
              value={ownerEmail}
              onChange={e => {
                setOwnerEmail(e.target.value);
                clearError('ownerEmail');
              }}
              onBlur={e => handleBlur('ownerEmail', e.target.value)}
            />
          </FormField>
        </div>

        {/* Progressive disclosure: none of this is needed to onboard a tenant. */}
        <div className="field-section">
          {!showOptional ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowOptional(true)}
              style={{ alignSelf: 'flex-start' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar datos fiscales y de contacto
            </button>
          ) : (
            <>
              <div className="field-section-label">Datos fiscales y de contacto</div>

              <div className="field-row">
                <FormField label="Nombre comercial" htmlFor="org-form-trade-name">
                  <input
                    type="text"
                    id="org-form-trade-name"
                    placeholder="Ej. PintuBajío"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                  />
                </FormField>

                <FormField label="RFC" htmlFor="org-form-tax-id">
                  <input
                    type="text"
                    id="org-form-tax-id"
                    placeholder="Ej. PBA010101AAA"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Dirección" htmlFor="org-form-address">
                <input
                  type="text"
                  id="org-form-address"
                  placeholder="Ej. León, Guanajuato"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </FormField>

              <FormField label="Correo de la organización" htmlFor="org-form-email" error={err('email')}>
                <input
                  type="email"
                  id="org-form-email"
                  placeholder="contacto@empresa.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  onBlur={e => handleBlur('email', e.target.value)}
                />
              </FormField>

              <FormField label="Teléfono" htmlFor="org-form-phone">
                <div className="phone-input-combo">
                  <select
                    id="org-form-countrycode"
                    aria-label="Código de país"
                    className="phone-country-select"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
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
                    id="org-form-phone"
                    className="phone-number-input"
                    placeholder="Ej. 477 123 4567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </FormField>
            </>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={showDiscard}
        tone="warn"
        title="¿Descartar esta organización?"
        body="Escribiste datos que todavía no se guardaron. Si salís ahora, se pierden."
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
