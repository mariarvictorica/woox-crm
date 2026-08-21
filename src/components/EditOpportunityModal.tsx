import React, { useState, useEffect } from 'react';
import { Contact, Opportunity, StageKey } from '../types';
import { UserAvatar } from './UserAvatar';
import { Dialog } from './Dialog';
import { FormField } from './FormField';

interface EditOpportunityModalProps {
  isOpen: boolean;
  opportunity: Opportunity;
  contacts: Contact[];
  onClose: () => void;
  onSave: (oppId: number, updatedFields: Partial<Opportunity>) => void;
}

function parseToDateInput(val?: string): string {
  if (!val || val === '—' || val === '-') {
    return new Date().toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    return val.trim();
  }
  const parsed = Date.parse(val);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

const parseMoney = (raw: string): number | null => {
  if (!raw.trim()) return null;
  const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

export const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({
  isOpen,
  opportunity,
  contacts,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [contactId, setContactId] = useState<number>(0);
  const [stage, setStage] = useState<StageKey>('nuevo');
  const [rep, setRep] = useState('Diego');
  const [valueStr, setValueStr] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [lostReason, setLostReason] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !opportunity) return;
    setName(opportunity.name || '');
    setContactId(opportunity.contactId || (contacts[0]?.id ?? 0));
    setStage(opportunity.stage || 'nuevo');
    setRep(opportunity.rep || 'Diego');
    setValueStr(
      opportunity.value !== null && opportunity.value !== undefined ? String(opportunity.value) : ''
    );
    setCloseDate(parseToDateInput(opportunity.close));
    setLostReason(opportunity.lostReason || '');
    setErrors({});
    setTouched({});
  }, [opportunity, isOpen, contacts]);

  // Conditional requirements follow the stage, so validation reads it directly
  // instead of duplicating the rule in blur and submit.
  const validateField = (field: string, value: string, forStage: StageKey): string => {
    const v = value.trim();
    switch (field) {
      case 'name':
        return v ? '' : 'Escribí el nombre de la oportunidad';
      case 'valueStr':
        if (forStage !== 'ganado') return '';
        return parseMoney(v) ? '' : 'Ingresá el valor cerrado';
      case 'closeDate':
        if (forStage !== 'ganado') return '';
        return v ? '' : 'Elegí la fecha de cierre';
      case 'lostReason':
        if (forStage !== 'perdido') return '';
        return v ? '' : 'Escribí por qué se perdió';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value, stage) }));
  };

  const handleStageChange = (newStage: StageKey) => {
    setStage(newStage);
    // Requirements changed, so drop errors that no longer apply.
    setErrors(prev => ({
      ...prev,
      valueStr: validateField('valueStr', valueStr, newStage),
      closeDate: validateField('closeDate', closeDate, newStage),
      lostReason: validateField('lostReason', lostReason, newStage)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {
      name: validateField('name', name, stage),
      valueStr: validateField('valueStr', valueStr, stage),
      closeDate: validateField('closeDate', closeDate, stage),
      lostReason: validateField('lostReason', lostReason, stage)
    };

    const order = ['name', 'valueStr', 'closeDate', 'lostReason'];
    const firstBad = order.find(k => nextErrors[k]);
    if (firstBad) {
      setErrors(nextErrors);
      setTouched({ name: true, valueStr: true, closeDate: true, lostReason: true });
      const idMap: Record<string, string> = {
        name: 'edit-opp-name',
        valueStr: 'edit-opp-value',
        closeDate: 'edit-opp-close-date',
        lostReason: 'edit-opp-lost-reason'
      };
      requestAnimationFrame(() => document.getElementById(idMap[firstBad])?.focus());
      return;
    }

    onSave(opportunity.id, {
      name: name.trim(),
      contactId: Number(contactId),
      stage,
      rep,
      value: parseMoney(valueStr),
      close: stage === 'ganado' ? closeDate : opportunity.close || '—',
      lostReason: stage === 'perdido' ? lostReason.trim() : opportunity.lostReason || undefined
    });

    onClose();
  };

  const err = (field: string) => (touched[field] ? errors[field] : '');

  return (
    <Dialog
      isOpen={isOpen}
      id="modal-edit-opp-card"
      title="Editar oportunidad"
      subtitle="Actualizá los datos comerciales de esta oportunidad."
      width="560px"
      onClose={onClose}
      onSubmit={handleSubmit}
      formId="form-edit-opp"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} id="btn-cancel-edit-opp">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" id="btn-save-edit-opp">
            Guardar cambios
          </button>
        </>
      }
    >
      <FormField label="Nombre de la oportunidad" htmlFor="edit-opp-name" required error={err('name')}>
        <input
          type="text"
          id="edit-opp-name"
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

      <FormField label="Contacto asociado" htmlFor="edit-opp-contact-select" required>
        <select
          id="edit-opp-contact-select"
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

      <div className="field-row">
        <FormField label="Etapa" htmlFor="edit-opp-stage" required>
          <select
            id="edit-opp-stage"
            value={stage}
            onChange={e => handleStageChange(e.target.value as StageKey)}
          >
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="negociacion">Negociación</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>
        </FormField>

        <FormField label="Rep asignado" htmlFor="edit-opp-rep" required>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              id="edit-opp-rep"
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
      </div>

      <FormField
        label="Valor estimado"
        htmlFor="edit-opp-value"
        required={stage === 'ganado'}
        error={err('valueStr')}
      >
        <input
          type="text"
          inputMode="decimal"
          id="edit-opp-value"
          placeholder="$0.00"
          value={valueStr}
          onChange={e => {
            setValueStr(e.target.value);
            if (errors.valueStr) setErrors(prev => ({ ...prev, valueStr: '' }));
          }}
          onBlur={e => handleBlur('valueStr', e.target.value)}
        />
      </FormField>

      {/* Only the stage that needs them shows them. */}
      {stage === 'ganado' && (
        <FormField
          label="Fecha de cierre"
          htmlFor="edit-opp-close-date"
          required
          error={err('closeDate')}
        >
          <input
            type="date"
            id="edit-opp-close-date"
            value={closeDate}
            onChange={e => {
              setCloseDate(e.target.value);
              if (errors.closeDate) setErrors(prev => ({ ...prev, closeDate: '' }));
            }}
            onBlur={e => handleBlur('closeDate', e.target.value)}
          />
        </FormField>
      )}

      {stage === 'perdido' && (
        <FormField
          label="Razón de pérdida"
          htmlFor="edit-opp-lost-reason"
          required
          error={err('lostReason')}
        >
          <textarea
            id="edit-opp-lost-reason"
            rows={3}
            placeholder="Ej. Eligió a la competencia por precio."
            value={lostReason}
            onChange={e => {
              setLostReason(e.target.value);
              if (errors.lostReason) setErrors(prev => ({ ...prev, lostReason: '' }));
            }}
            onBlur={e => handleBlur('lostReason', e.target.value)}
          />
        </FormField>
      )}
    </Dialog>
  );
};
