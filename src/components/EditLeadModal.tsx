import React, { useState, useEffect } from 'react';
import { Contact, LeadSource } from '../types';
import { COUNTRY_CODES, splitPhone } from '../data/initialData';
import { Dialog } from './Dialog';
import { FormField } from './FormField';

interface EditLeadModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSave: (leadId: number, updatedFields: Partial<Contact>) => void;
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

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSave
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

  useEffect(() => {
    if (!contact || !isOpen) return;

    let fName = contact.firstName || '';
    let lName = contact.lastName || '';
    if (!fName && !lName && contact.name) {
      const parts = contact.name.trim().split(' ');
      if (parts.length > 1) {
        fName = parts[0];
        lName = parts.slice(1).join(' ');
      } else {
        fName = contact.name;
        lName = '';
      }
    }
    setFirstName(fName);
    setLastName(lName);
    setCompany(contact.company || '');
    setEmail(contact.email || '');
    setGiro(contact.giro || '');

    const { code, number } = splitPhone(contact.phone || '');
    setCountryCode(code);
    setPhone(number);

    if (contact.src === 'b2b' || contact.srcLabel === 'B2B') setOrigin('B2B');
    else if (contact.src === 'online' || contact.srcLabel === 'ONL') setOrigin('Online');
    else setOrigin('Retail');

    setTouched({});
  }, [contact, isOpen]);

  const errors: Record<string, string> = {};
  if (!firstName.trim()) errors.firstName = 'Escribí el nombre del contacto';
  if (!lastName.trim()) errors.lastName = 'Escribí el apellido del contacto';
  if (email.trim() && !EMAIL_RE.test(email.trim())) {
    errors.email = 'Revisá el formato del correo (ej. contacto@empresa.com)';
  }
  if (phone.trim() && phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'El teléfono necesita al menos 7 dígitos';
  }

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, phone: true, email: true });

    const order = ['firstName', 'lastName', 'phone', 'email'];
    const firstBad = order.find(k => errors[k]);
    if (firstBad) {
      const idMap: Record<string, string> = {
        firstName: 'edit-lead-form-firstname',
        lastName: 'edit-lead-form-lastname',
        phone: 'edit-lead-form-phone',
        email: 'edit-lead-form-email'
      };
      requestAnimationFrame(() => document.getElementById(idMap[firstBad])?.focus());
      return;
    }

    const originConfig = ORIGIN_OPTIONS.find(o => o.label === origin) || ORIGIN_OPTIONS[0];

    onSave(contact.id, {
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      phone: phone.trim() ? `${countryCode} ${phone.trim()}` : '',
      email: email.trim(),
      src: originConfig.value,
      srcLabel: originConfig.code,
      giro: giro.trim() || '',
      type: company.trim() ? 'Empresa' : 'Particular'
    });

    onClose();
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  return (
    <Dialog
      isOpen={isOpen}
      id="modal-edit-lead-card"
      title="Editar contacto"
      subtitle="Actualizá los datos de este contacto."
      width="560px"
      onClose={onClose}
      onSubmit={handleSubmit}
      formId="form-edit-lead"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" id="btn-submit-edit-lead">
            Guardar cambios
          </button>
        </>
      }
    >
      <div className="field-row">
        <FormField label="Nombre" htmlFor="edit-lead-form-firstname" required error={err('firstName')}>
          <input
            type="text"
            id="edit-lead-form-firstname"
            data-autofocus
            placeholder="Ej. María"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onBlur={() => handleBlur('firstName')}
          />
        </FormField>

        <FormField label="Apellido" htmlFor="edit-lead-form-lastname" required error={err('lastName')}>
          <input
            type="text"
            id="edit-lead-form-lastname"
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
                id={`edit-origin-chip-${opt.label.toLowerCase()}`}
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

      <div className="field-section">
        <div className="field-section-label">Datos de contacto</div>

        <FormField label="Teléfono" htmlFor="edit-lead-form-phone" error={err('phone')}>
          <div className="phone-input-combo">
            <select
              id="edit-lead-form-countrycode"
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
              id="edit-lead-form-phone"
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
          htmlFor="edit-lead-form-email"
          hint="Para cotizaciones y notas."
          error={err('email')}
        >
          <input
            type="email"
            inputMode="email"
            id="edit-lead-form-email"
            placeholder="Ej. contacto@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
          />
        </FormField>
      </div>

      <div className="field-section">
        <div className="field-section-label">Cuenta</div>

        <FormField label="Empresa" htmlFor="edit-lead-form-company" hint="Razón social, negocio o despacho.">
          <input
            type="text"
            id="edit-lead-form-company"
            placeholder="Ej. Constructora del Norte S.A. de C.V."
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </FormField>

        <FormField label="Giro comercial" htmlFor="edit-lead-form-giro" hint="Sector o industria de la cuenta.">
          <select id="edit-lead-form-giro" value={giro} onChange={e => setGiro(e.target.value)}>
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
  );
};
