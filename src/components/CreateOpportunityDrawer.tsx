import React, { useState, useEffect, useRef } from 'react';
import { Contact, Opportunity } from '../types';
import { UserAvatar } from './UserAvatar';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';
import { getOriginBadgeClass, getOriginDisplayName } from './LeadsView';

const REP_OPTIONS = [
  { value: 'Diego', label: 'Diego' },
  { value: 'Maribel', label: 'Maribel' },
  { value: 'Adamaris', label: 'Adamaris' },
  { value: 'Enrique Macias', label: 'Enrique Macias (Manager)' }
];

interface CreateOpportunityDrawerProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onCreateOpportunity: (newOpp: Partial<Opportunity>) => void;
  onShowToast?: (msg: string) => void;
}

export const CreateOpportunityDrawer: React.FC<CreateOpportunityDrawerProps> = ({
  isOpen,
  contact,
  onClose,
  onCreateOpportunity,
  onShowToast
}) => {
  const [name, setName] = useState('');
  const [rep, setRep] = useState('Diego');
  const [valueStr, setValueStr] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isRepOpen, setIsRepOpen] = useState(false);
  const repSelectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setRep(contact.owner && contact.owner !== 'Unassigned' ? contact.owner : 'Diego');
    setValueStr('');
    setDescription('');
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setShowDiscard(false);
    setIsRepOpen(false);
  }, [isOpen, contact]);

  useEffect(() => {
    if (!isRepOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (repSelectRef.current && !repSelectRef.current.contains(e.target as Node)) setIsRepOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsRepOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isRepOpen]);

  const isDirty = Boolean(name.trim() || valueStr.trim() || description.trim());

  const validateName = (v: string) => (v.trim() ? '' : 'Escribí el nombre de la oportunidad');

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'name') setErrors(prev => ({ ...prev, name: validateName(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setErrors({ name: nameError });
      setTouched({ name: true });
      requestAnimationFrame(() => document.getElementById('drawer-opp-name')?.focus());
      return;
    }

    setIsSubmitting(true);

    // Forgiving input: accept "$12,000" and normalize it here.
    let parsedValue: number | null = null;
    if (valueStr.trim()) {
      const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) parsedValue = num;
    }

    setTimeout(() => {
      onCreateOpportunity({
        name: name.trim(),
        contactId: contact.id,
        // New opportunities always start in "Nuevo". Stage only changes
        // from the opportunity's detail view.
        stage: 'nuevo',
        rep,
        value: parsedValue,
        close: '—',
        description: description.trim() || undefined,
        last: 'justo ahora'
      });

      setIsSubmitting(false);
      onClose();
      if (onShowToast) {
        onShowToast(`Oportunidad "${name.trim()}" creada y ligada a ${contact.name}`);
      }
    }, 180);
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  return (
    <>
      <Dialog
        isOpen={isOpen}
        variant="drawer"
        id="opp-drawer-panel"
        title="Crear oportunidad"
        subtitle={`Se liga automáticamente a ${contact.name}.`}
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={onClose}
        onSubmit={handleSubmit}
        formId="create-opp-form"
        footer={
          <>
            <button
              type="button"
              id="btn-cancel-opp-drawer"
              className="btn btn-ghost"
              onClick={() => (isDirty ? setShowDiscard(true) : onClose())}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-opp-drawer"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  Guardando…
                </>
              ) : (
                'Crear oportunidad'
              )}
            </button>
          </>
        }
      >
        {/* Context first: which lead this belongs to, read-only. */}
        <FormField label="Contacto asociado" readOnly>
          <div className="drawer-associated-lead-card" id="drawer-lead-preview">
            <div className="drawer-lead-meta">
              <UserAvatar name={contact.name} size="md" />
              <div style={{ minWidth: 0 }}>
                <div className="drawer-lead-name">{contact.name}</div>
                <div className="drawer-lead-sub">
                  {contact.company ? `${contact.company} · ` : ''}
                  {contact.giro || 'Lead activo'}
                </div>
              </div>
            </div>
            <span
              className={`origin-badge origin-badge-${getOriginBadgeClass(contact.src, contact.srcLabel)}`}
              title={`Origen: ${getOriginDisplayName(contact.src, contact.srcLabel)}`}
            >
              {getOriginDisplayName(contact.src, contact.srcLabel)}
            </span>
          </div>
        </FormField>

        <FormField label="Nombre de la oportunidad" htmlFor="drawer-opp-name" required error={err('name')}>
          <input
            type="text"
            id="drawer-opp-name"
            data-autofocus
            placeholder="Ej. Suministro de acabados terraza"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            onBlur={e => handleBlur('name', e.target.value)}
          />
        </FormField>

        <FormField label="Rep asignado" htmlFor="drawer-opp-rep" required>
          <div className="rep-select" ref={repSelectRef}>
            <button
              type="button"
              id="drawer-opp-rep"
              className={`rep-select-trigger ${isRepOpen ? 'active' : ''}`}
              onClick={() => setIsRepOpen(prev => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isRepOpen}
            >
              <span className="rep-select-value">
                <UserAvatar name={rep} size="sm" />
                <span>{REP_OPTIONS.find(o => o.value === rep)?.label || rep}</span>
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isRepOpen && (
              <div className="rep-select-panel" role="listbox" aria-label="Rep asignado">
                {REP_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={rep === o.value}
                    className={`rep-select-option ${rep === o.value ? 'selected' : ''}`}
                    onClick={() => {
                      setRep(o.value);
                      setIsRepOpen(false);
                    }}
                  >
                    <UserAvatar name={o.value} size="sm" />
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>

        <div className="field-section">
          <div className="field-section-label">Detalles</div>

          <FormField
            label="Valor estimado"
            htmlFor="drawer-opp-value"
            hint="Se puede completar más adelante."
          >
            <input
              type="text"
              inputMode="decimal"
              id="drawer-opp-value"
              placeholder="$0.00"
              value={valueStr}
              onChange={e => setValueStr(e.target.value)}
            />
          </FormField>

          <FormField label="Descripción o requerimientos" htmlFor="drawer-opp-desc">
            <textarea
              id="drawer-opp-desc"
              rows={3}
              placeholder="Volumen, especificaciones técnicas, fechas tentativas de entrega…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={showDiscard}
        tone="warn"
        title="¿Descartar esta oportunidad?"
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
