import React, { useState, useEffect } from 'react';
import { Contact, Opportunity } from '../types';
import { UserAvatar } from './UserAvatar';
import { Dialog } from './Dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';

interface NewOpportunityModalProps {
  isOpen: boolean;
  contacts: Contact[];
  preselectedContactId?: number;
  onClose: () => void;
  onCreateOpportunity: (newOpp: Partial<Opportunity>) => void;
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  contacts,
  preselectedContactId,
  onClose,
  onCreateOpportunity
}) => {
  const [name, setName] = useState('');
  const [contactId, setContactId] = useState<number>(0);
  const [rep, setRep] = useState('Diego');
  const [valueStr, setValueStr] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (preselectedContactId !== undefined) {
      setContactId(preselectedContactId);
    } else if (contacts.length > 0) {
      setContactId(contacts[0].id);
    }
    setName('');
    setValueStr('');
    setErrors({});
    setTouched({});
    setShowDiscard(false);
  }, [preselectedContactId, contacts, isOpen]);

  const isDirty = Boolean(name.trim() || valueStr.trim());

  const validateField = (field: string, value: string): string => {
    if (field === 'name') return value.trim() ? '' : 'Escribí el nombre de la oportunidad';
    return '';
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateField('name', name);
    if (nameError) {
      setErrors({ name: nameError });
      setTouched({ name: true });
      requestAnimationFrame(() => document.getElementById('opp-form-name')?.focus());
      return;
    }

    // Forgiving input: strip currency formatting the user may have typed
    // ("$12,000") rather than rejecting it.
    let numValue: number | null = null;
    if (valueStr.trim()) {
      const parsed = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) numValue = parsed;
    }

    // New opportunities always start in "Nuevo". Stage only changes from
    // the opportunity's detail view.
    onCreateOpportunity({
      name: name.trim(),
      contactId: Number(contactId),
      stage: 'nuevo',
      rep,
      value: numValue,
      close: '—',
      last: 'justo ahora'
    });

    setName('');
    setValueStr('');
    onClose();
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  return (
    <>
      <Dialog
        isOpen={isOpen}
        id="modal-opp-card"
        title="Agregar oportunidad"
        subtitle="Una venta en curso, ligada a un contacto que ya existe."
        width="560px"
        isDirty={isDirty}
        onRequestDiscard={() => setShowDiscard(true)}
        onClose={onClose}
        onSubmit={handleSubmit}
        formId="form-new-opp"
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
              Crear oportunidad
            </button>
          </>
        }
      >
        <FormField label="Nombre de la oportunidad" htmlFor="opp-form-name" required error={err('name')}>
          <input
            type="text"
            id="opp-form-name"
            data-autofocus
            placeholder="Ej. Cotización acabado exterior"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            onBlur={e => handleBlur('name', e.target.value)}
          />
        </FormField>

        <FormField label="Contacto asociado" htmlFor="opp-contact-select" required>
          <select
            id="opp-contact-select"
            value={contactId}
            onChange={e => setContactId(Number(e.target.value))}
          >
            {contacts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ''}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Rep asignado" htmlFor="opp-form-rep" required>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              id="opp-form-rep"
              value={rep}
              onChange={e => setRep(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="Diego">Diego</option>
              <option value="Maribel">Maribel</option>
              <option value="Adamaris">Adamaris</option>
            </select>
            <UserAvatar name={rep} size="md" />
          </div>
        </FormField>

        <FormField
          label="Valor estimado"
          htmlFor="opp-form-value"
          hint="Se puede completar más adelante."
        >
          <input
            type="text"
            inputMode="decimal"
            id="opp-form-value"
            placeholder="$0.00"
            value={valueStr}
            onChange={e => setValueStr(e.target.value)}
          />
        </FormField>
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
