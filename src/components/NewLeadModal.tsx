import React, { useState, useEffect, useCallback } from 'react';
import { Contact, LeadSource } from '../types';
import { COUNTRY_CODES } from '../data/initialData';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (newLead: Partial<Contact>) => Contact;
  onViewLead: (leadId: number) => void;
  onCreateOpportunity: (contactId: number) => void;
  onShowToast?: (msg: string) => void;
}

type OriginOption = 'Retail' | 'B2B' | 'Online';

const ORIGIN_OPTIONS: { label: OriginOption; value: LeadSource; code: string }[] = [
  { label: 'Retail', value: 'retail', code: 'RET' },
  { label: 'B2B', value: 'b2b', code: 'B2B' },
  { label: 'Online', value: 'online', code: 'ONL' }
];

const GIRO_OPTIONS = [
  'Hotelería',
  'Construcción',
  'Arquitectura',
  'Retail',
  'Servicios',
  'Industrial / Manufactura',
  'Particular / Residencial',
  'Otro'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  onViewLead,
  onCreateOpportunity,
  onShowToast
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [origin, setOrigin] = useState<OriginOption>('Retail');
  const [countryCode, setCountryCode] = useState('+52');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [giro, setGiro] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [createdLead, setCreatedLead] = useState<Contact | null>(null);
  const [showDiscard, setShowDiscard] = useState(false);

  const handleReset = useCallback(() => {
    setFirstName('');
    setLastName('');
    setOrigin('Retail');
    setCountryCode('+52');
    setPhone('');
    setEmail('');
    setCompany('');
    setGiro('');
    setTouched({});
    setCreatedLead(null);
    setShowDiscard(false);
  }, []);

  useEffect(() => {
    if (isOpen) handleReset();
  }, [isOpen, handleReset]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // Derived, so blur and submit can never disagree about validity.
  const errors: Record<string, string> = {};
  if (!firstName.trim()) errors.firstName = 'Escribí el nombre del contacto';
  if (!lastName.trim()) errors.lastName = 'Escribí el apellido del contacto';
  if (email.trim() && !EMAIL_RE.test(email.trim())) {
    errors.email = 'Revisá el formato del correo (ej. contacto@empresa.com)';
  }
  // Forgiving: count digits only, so spaces, dashes and parens are all fine.
  if (phone.trim() && phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'El teléfono necesita al menos 7 dígitos';
  }

  const isDirty = Boolean(
    firstName.trim() || lastName.trim() || phone.trim() || email.trim() || company.trim() || giro.trim()
  );

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const requestClose = () => {
    // Once the lead is created there's nothing left to lose.
    if (isDirty && !createdLead) setShowDiscard(true);
    else handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ firstName: true, lastName: true, phone: true, email: true });

    // Submit is always enabled: a disabled button can't tell the user what's
    // wrong. Instead, surface the errors and jump to the first bad field.
    const order = ['firstName', 'lastName', 'phone', 'email'];
    const firstBad = order.find(k => errors[k]);
    if (firstBad) {
      const idMap: Record<string, string> = {
        firstName: 'lead-form-firstname',
        lastName: 'lead-form-lastname',
        phone: 'lead-form-phone',
        email: 'lead-form-email'
      };
      requestAnimationFrame(() => document.getElementById(idMap[firstBad])?.focus());
      return;
    }

    const originConfig = ORIGIN_OPTIONS.find(o => o.label === origin) || ORIGIN_OPTIONS[0];

    const newLeadResult = onCreateLead({
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      phone: phone.trim() ? `${countryCode} ${phone.trim()}` : '',
      email: email.trim(),
      src: originConfig.value,
      srcLabel: originConfig.code,
      region: 'México',
      giro: giro.trim() || '',
      hot: false,
      last: 'justo ahora',
      createdAt: new Date().toISOString().split('T')[0],
      type: company.trim() ? 'Empresa' : 'Particular'
    });

    if (onShowToast) onShowToast('Contacto guardado con éxito');
    setCreatedLead(newLeadResult);
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  // ---- Post-creation step: pick what to do next, or just close. ----
  if (createdLead) {
    return (
      <Dialog
        isOpen={isOpen}
        id="modal-lead-card"
        title="Contacto guardado"
        subtitle={`${createdLead.name}${createdLead.company ? ` · ${createdLead.company}` : ''} ya está en el sistema.`}
        width="520px"
        onClose={handleClose}
        footer={
          <>
            <button type="button" className="btn btn-ghost foot-spacer" onClick={handleClose}>
              Listo
            </button>
            <button id="btn-view-created-lead" className="btn btn-ghost" onClick={() => { onViewLead(createdLead.id); handleClose(); }}>
              Ver contacto
            </button>
            <button
              id="btn-create-opp-for-lead"
              className="btn btn-primary"
              onClick={() => { onCreateOpportunity(createdLead.id); handleClose(); }}
            >
              Crear oportunidad…
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0 8px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--good-bg)',
              color: 'var(--good)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--ink-700)', lineHeight: 1.5, margin: 0 }}>
            Podés crearle una oportunidad ahora o seguir después desde su ficha.
          </p>
        </div>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        isOpen={isOpen}
        id="modal-lead-card"
        title="Agregar contacto"
        subtitle="Con el nombre y el origen alcanza para empezar."
        width="560px"
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={handleClose}
        onSubmit={handleSubmit}
        formId="form-new-lead"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={requestClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-lead">
              Guardar contacto
            </button>
          </>
        }
      >
        {/* Who they are — the only genuinely required information. */}
        <div className="field-row">
          <FormField label="Nombre" htmlFor="lead-form-firstname" required error={err('firstName')}>
            <input
              type="text"
              id="lead-form-firstname"
              data-autofocus
              placeholder="Ej. María"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
            />
          </FormField>

          <FormField label="Apellido" htmlFor="lead-form-lastname" required error={err('lastName')}>
            <input
              type="text"
              id="lead-form-lastname"
              placeholder="Ej. Fernández"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
            />
          </FormField>
        </div>

        <FormField label="Origen" required hint="Canal por el que se captó el contacto.">
          <div className="origin-chips-group" role="radiogroup" aria-label="Origen del contacto">
            {ORIGIN_OPTIONS.map(opt => {
              const isSelected = origin === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  id={`origin-chip-${opt.label.toLowerCase()}`}
                  className={`origin-chip-btn ${isSelected ? 'active' : ''}`}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setOrigin(opt.label)}
                >
                  <span className="chip-radio-dot">
                    {isSelected && <span className="chip-radio-dot-inner" />}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* How to reach them. */}
        <div className="field-section">
          <div className="field-section-label">Datos de contacto</div>

          <FormField label="Teléfono" htmlFor="lead-form-phone" error={err('phone')}>
            <div className="phone-input-combo">
              <select
                id="lead-form-countrycode"
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
                id="lead-form-phone"
                className="phone-number-input"
                placeholder="Ej. 55 1234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onBlur={() => handleBlur('phone')}
              />
            </div>
          </FormField>

          <FormField
            label="Correo electrónico"
            htmlFor="lead-form-email"
            hint="Para cotizaciones y notas."
            error={err('email')}
          >
            <input
              type="email"
              inputMode="email"
              id="lead-form-email"
              placeholder="Ej. contacto@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
            />
          </FormField>
        </div>

        {/* Segmentation — useful, never blocking. */}
        <div className="field-section">
          <div className="field-section-label">Cuenta</div>

          <FormField label="Empresa" htmlFor="lead-form-company" hint="Razón social, negocio o despacho.">
            <input
              type="text"
              id="lead-form-company"
              placeholder="Ej. Constructora del Norte S.A. de C.V."
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </FormField>

          <FormField label="Giro comercial" htmlFor="lead-form-giro" hint="Sector o industria de la cuenta.">
            <select id="lead-form-giro" value={giro} onChange={e => setGiro(e.target.value)}>
              <option value="">Seleccionar giro comercial…</option>
              {GIRO_OPTIONS.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={showDiscard}
        tone="warn"
        title="¿Descartar este contacto?"
        body="Escribiste datos que todavía no se guardaron. Si salís ahora, se pierden."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onCancel={() => setShowDiscard(false)}
        onConfirm={() => {
          setShowDiscard(false);
          handleClose();
        }}
      />
    </>
  );
};
