import React, { useState } from 'react';
import { Opportunity, Contact, StageKey, NoteItem, ActivityEvent } from '../types';
import { STAGE_CONFIG, STAGE_LABEL, formatMoney } from '../data/initialData';
import { UserAvatar } from './UserAvatar';
import { EditOpportunityModal } from './EditOpportunityModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';
import { FormField } from './FormField';
import { NotesAndFiles } from './NotesAndFiles';

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

interface OpportunityDetailViewProps {
  opportunity: Opportunity;
  contact: Contact | undefined;
  contacts?: Contact[];
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
  onUpdateNote: (noteId: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (noteId: string) => void;
  onBack: () => void;
  onSelectLead: (leadId: number) => void;
  onSelectOpportunity: (oppId: number) => void;
  onUpdateStage: (oppId: number, stage: StageKey, extraFields?: { value?: number | null; close?: string; lostReason?: string }) => void;
  onUpdateOpportunity?: (oppId: number, updatedFields: Partial<Opportunity>) => void;
  onShowToast: (msg: string) => void;
  /** Who is signed in, for note authorship. */
  currentUserName: string;
}

function generateSuggestedReply(
  clientMsg: string,
  contact: Contact | undefined,
  opp: Opportunity,
  variant: number = 0
): string {
  const firstName = contact?.name ? contact.name.trim().split(' ')[0] : 'Estimado cliente';
  const company = contact?.company ? contact.company.trim() : '';
  const oppName = opp.name || 'su proyecto';
  const oppVal = opp.value ? formatMoney(opp.value) : 'el presupuesto acordado';
  const region = contact?.region || 'su localidad';
  const repName = opp.rep || 'nuestro equipo comercial';
  const q = clientMsg.toLowerCase();

  // 1. Preguntas sobre cotización / precio / presupuesto
  if (q.includes('cotiza') || q.includes('precio') || q.includes('presupuesto') || q.includes('costo') || q.includes('cuanto') || q.includes('cuánto')) {
    if (variant % 2 === 0) {
      return `"Hola ${firstName}, un gusto saludarte. Con respecto a ${oppName}${company ? ` para ${company}` : ''}, te confirmo que el presupuesto estimado es de ${oppVal}. Con gusto te hago llegar la cotización formal desglosada en PDF con tiempos de entrega a ${region}. ¿Te gustaría que la preparemos de inmediato?"`;
    } else {
      return `"Hola ${firstName}, claro que sí. En ${repName} tenemos lista la propuesta económica para ${oppName} (${oppVal}). Incluye la ficha de aplicación y términos comerciales. Si me confirmas tus datos fiscales o dirección de entrega, te la comparto enseguida."`;
    }
  }

  // 2. Preguntas sobre envío / flete / tiempo de entrega
  if (q.includes('envio') || q.includes('envío') || q.includes('flete') || q.includes('tarda') || q.includes('tiempo') || q.includes('entrega') || q.includes('llega') || q.includes('playa') || q.includes('cancun') || q.includes('cancún')) {
    if (variant % 2 === 0) {
      return `"Hola ${firstName}, con respecto a la entrega para ${oppName} en ${region}, coordinamos envíos asegurados con fleteras certificadas con tiempos habituales de 3 a 5 días hábiles. El material viaja empacado con protección industrial directo a tu obra. ¿Deseas que incluyamos el flete consolidado en la cotización?"`;
    } else {
      return `"Hola ${firstName}, te confirmo que realizamos despachos puntuales a ${region}. Para el volumen requerido en ${company || oppName}, programamos la salida de almacén para que cuentes con el material en la fecha programada. ¿Para qué día exacto lo necesitan en sitio?"`;
    }
  }

  // 3. Descuento / negociación / volumen
  if (q.includes('descuento') || q.includes('rebaja') || q.includes('promocion') || q.includes('promoción') || q.includes('menos') || q.includes('caro')) {
    if (variant % 2 === 0) {
      return `"Hola ${firstName}, entiendo perfectamente la importancia del presupuesto para ${company || oppName}. Al tratarse de un proyecto de esta escala (${oppVal}), podemos evaluar una condición comercial preferencial por volumen o facilidades de pago. ¿Te parece si lo revisamos brevemente con ${repName}?"`;
    } else {
      return `"Hola ${firstName}, con gusto revisamos el mejor esquema de precios para ${oppName}. Si confirmamos el pedido durante esta semana para planificar producción, podemos aplicar una bonificación en el costo de suministro. ¿Qué volumen final tienes proyectado?"`;
    }
  }

  // 4. Muestras / catálogo / ficha técnica
  if (q.includes('muestra') || q.includes('ficha') || q.includes('catalogo') || q.includes('catálogo') || q.includes('especificacion') || q.includes('especificación') || q.includes('certificado')) {
    if (variant % 2 === 0) {
      return `"Hola ${firstName}, con mucho gusto te comparto la ficha técnica completa y certificados de durabilidad para ${oppName}. Si requieres muestras físicas para validación con tu equipo en ${company || 'obra'}, te las podemos enviar hoy mismo a ${region}. ¿A qué dirección te las hacemos llegar?"`;
    } else {
      return `"Hola ${firstName}, claro que sí. Te adjunto las especificaciones de rendimiento y resistencia del acabado. Nuestros productos cuentan con garantía directa de fábrica. ¿Te gustaría que programemos una asesoría técnica de 10 minutos con ${repName}?"`;
    }
  }

  // 5. Garantía / sol / humedad / intemperie
  if (q.includes('garantia') || q.includes('garantía') || q.includes('humedad') || q.includes('sol') || q.includes('mar') || q.includes('exterior') || q.includes('durabilidad')) {
    return `"Hola ${firstName}, el acabado especificado para ${oppName} está diseñado con tecnología de alta protección contra rayos UV, salinidad y humedad extrema (ideal para ${region}). Cuenta con garantía de durabilidad y mínimo mantenimiento. Te comparto el reporte de rendimiento junto con la cotización."`;
  }

  // 6. Reunión / llamada / visita
  if (q.includes('reunion') || q.includes('reunión') || q.includes('llamada') || q.includes('agendar') || q.includes('visita') || q.includes('hablar') || q.includes('revisar')) {
    return `"Hola ${firstName}, excelente. Con mucho gusto coordinamos una sesión con ${repName} para revisar a detalle los requerimientos de ${oppName} (${company || 'tu empresa'}) y resolver cualquier punto técnico. ¿Te queda bien hoy por la tarde o prefieres mañana a primera hora?"`;
  }

  // 7. General contextual
  if (variant % 2 === 0) {
    return `"Hola ${firstName}, gracias por tu mensaje. Con respecto a ${oppName}${company ? ` en ${company}` : ''}, estamos al pendiente para dar el siguiente paso en la etapa de ${STAGE_LABEL[opp.stage]}. ${repName} tiene lista toda la información comercial para coordinar contigo. ¿Te gustaría que avancemos?"`;
  } else {
    return `"Hola ${firstName}, un gusto saludarte. Revisando los requerimientos de ${oppName} (${oppVal}), quedamos a tus órdenes para resolver cualquier duda y proceder con la entrega de la propuesta. ¿Hay algún detalle adicional que te gustaría contemplar?"`;
  }
}

export const OpportunityDetailView: React.FC<OpportunityDetailViewProps> = ({
  opportunity,
  contact,
  contacts = [],
  notes: allNotes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onBack,
  onSelectLead,
  onSelectOpportunity,
  onUpdateStage,
  onUpdateOpportunity,
  onShowToast,
  currentUserName
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [clientMessage, setClientMessage] = useState('');
  const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editableResponseText, setEditableResponseText] = useState('');
  const [variantIndex, setVariantIndex] = useState(0);

  // Opportunity view shows only the notes tagged to this specific
  // opportunity — contact-level notes and notes from the contact's other
  // opportunities stay out of scope here.
  const notes = allNotes.filter(n => n.opportunityId === opportunity.id);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const [timelineEvents, setTimelineEvents] = useState<ActivityEvent[]>([
    {
      id: 'tl-1',
      initial: 'D',
      type: 'rep',
      author: 'Diego',
      action: 'agregó una nota',
      when: 'hoy, 10:42'
    },
    {
      id: 'tl-2',
      initial: 'IA',
      type: 'ai',
      author: 'IA',
      action: 'generó sugerencia de respuesta',
      when: 'hoy, 10:40'
    },
    {
      id: 'tl-3',
      initial: 'D',
      type: 'rep',
      author: 'Diego',
      action: 'movió la oportunidad a Negociación',
      when: 'ayer, 17:20'
    },
    {
      id: 'tl-4',
      initial: 'S',
      type: 'sys',
      author: 'Sistema',
      action: `creó la oportunidad ligada al contacto ${contact?.name || 'Cliente'}`,
      when: 'ayer, 17:05'
    }
  ]);

  // Stage change validation modals
  const [showWonModal, setShowWonModal] = useState(false);
  const [wonValue, setWonValue] = useState('');
  const [wonClose, setWonClose] = useState('');
  const [wonErrors, setWonErrors] = useState<{ value?: string; close?: string }>({});

  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostReasonError, setLostReasonError] = useState('');

  const hasValidValue = (val: number | null | undefined): boolean => {
    return typeof val === 'number' && !isNaN(val) && val > 0;
  };

  const hasValidClose = (closeDate: string | undefined): boolean => {
    if (!closeDate) return false;
    const trimmed = closeDate.trim();
    return trimmed !== '' && trimmed !== '—' && trimmed !== '-';
  };

  const executeStageChange = (
    newStage: StageKey,
    extraFields?: { value?: number | null; close?: string; lostReason?: string }
  ) => {
    onUpdateStage(opportunity.id, newStage, extraFields);
    onShowToast(`Etapa actualizada a "${STAGE_LABEL[newStage]}" — se registró en la línea de tiempo`);

    const newEvent: ActivityEvent = {
      id: 'tl-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: currentUserName.split(' ')[0],
      action: `movió la oportunidad a ${STAGE_LABEL[newStage]}`,
      when: 'justo ahora'
    };
    setTimelineEvents([newEvent, ...timelineEvents]);
  };

  const handleStageClick = (stageKey: StageKey) => {
    if (stageKey === opportunity.stage) return;

    if (stageKey === 'ganado') {
      const valOk = hasValidValue(opportunity.value);
      const closeOk = hasValidClose(opportunity.close);

      if (valOk && closeOk) {
        executeStageChange('ganado');
      } else {
        setWonValue(valOk && opportunity.value ? String(opportunity.value) : '');
        setWonClose(closeOk && opportunity.close ? parseToDateInput(opportunity.close) : new Date().toISOString().split('T')[0]);
        setWonErrors({});
        setShowWonModal(true);
      }
      return;
    }

    if (stageKey === 'perdido') {
      setLostReason(opportunity.lostReason || '');
      setLostReasonError('');
      setShowLostModal(true);
      return;
    }

    executeStageChange(stageKey);
  };

  const handleConfirmWon = (e: React.FormEvent) => {
    e.preventDefault();
    const valOk = hasValidValue(opportunity.value);
    const closeOk = hasValidClose(opportunity.close);
    const errors: { value?: string; close?: string } = {};

    let finalValue: number | null = opportunity.value;
    let finalClose: string = opportunity.close;

    if (!valOk) {
      const parsedNum = parseFloat(wonValue.replace(/[^0-9.]/g, ''));
      if (!wonValue.trim() || isNaN(parsedNum) || parsedNum <= 0) {
        errors.value = 'Ingresá el valor estimado';
      } else {
        finalValue = parsedNum;
      }
    }

    if (!closeOk) {
      if (!wonClose.trim() || wonClose.trim() === '—' || wonClose.trim() === '-') {
        errors.close = 'Ingresá la fecha estimada de cierre';
      } else {
        finalClose = wonClose.trim();
      }
    }

    if (Object.keys(errors).length > 0) {
      setWonErrors(errors);
      return;
    }

    executeStageChange('ganado', { value: finalValue, close: finalClose });
    setShowWonModal(false);
  };

  const handleConfirmLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReason.trim()) {
      setLostReasonError('Ingresá el motivo de pérdida');
      return;
    }

    executeStageChange('perdido', { lostReason: lostReason.trim() });
    setShowLostModal(false);
  };

  const handleSaveOpportunity = (oppId: number, updatedFields: Partial<Opportunity>) => {
    if (onUpdateOpportunity) {
      onUpdateOpportunity(oppId, updatedFields);
    }
    const newEvent: ActivityEvent = {
      id: 'tl-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: currentUserName.split(' ')[0],
      action: 'actualizó los datos de la oportunidad',
      when: 'justo ahora'
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  // Thin wrappers around the shared handlers so this view keeps logging
  // to its own local activity timeline — a concern the shared
  // NotesAndFiles component intentionally knows nothing about.
  const handleAddNoteWithTimeline = (note: NoteItem) => {
    onAddNote(note);
    const newEvent: ActivityEvent = {
      id: 'tl-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: currentUserName.split(' ')[0],
      action: 'agregó una nueva nota con adjuntos',
      when: 'justo ahora'
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  const handleDeleteNoteWithTimeline = (noteId: string) => {
    onDeleteNote(noteId);
    const newEvent: ActivityEvent = {
      id: 'tl-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: currentUserName.split(' ')[0],
      action: 'eliminó una nota de la oportunidad',
      when: 'justo ahora'
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };


  const handleGenerateResponse = (msgToAnalyze?: string, nextVariant?: number) => {
    const text = msgToAnalyze !== undefined ? msgToAnalyze : clientMessage;
    if (!text.trim()) {
      onShowToast('Ingresa o pega primero el mensaje del cliente');
      return;
    }

    setIsGenerating(true);
    setIsEditingResponse(false);

    setTimeout(() => {
      const vIdx = nextVariant !== undefined ? nextVariant : variantIndex;
      const generated = generateSuggestedReply(text.trim(), contact, opportunity, vIdx);
      setSuggestedResponse(generated);
      setIsGenerating(false);
      onShowToast('Sugerencia de respuesta generada con base en el mensaje del cliente');

      const newEvent: ActivityEvent = {
        id: 'tl-' + Date.now(),
        initial: 'IA',
        type: 'ai',
        author: 'IA',
        action: 'analizó mensaje del cliente y generó respuesta sugerida',
        when: 'justo ahora'
      };
      setTimelineEvents(prev => [newEvent, ...prev]);
    }, 280);
  };

  const handleRegenerateSuggestion = () => {
    const nextVar = variantIndex + 1;
    setVariantIndex(nextVar);
    handleGenerateResponse(clientMessage, nextVar);
  };

  const handleCopySuggestion = () => {
    if (!suggestedResponse) return;
    navigator.clipboard?.writeText?.(suggestedResponse);
    onShowToast('Mensaje copiado al portapapeles — listo para enviar');
  };

  const handleAskAI = (question: string) => {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    let response = '';

    if (q.includes('resumir') || q.includes('3 puntos')) {
      response = `1. Cliente interesado en acabado para 3 terrazas (${contact?.company || 'Hotelería'}). 2. Solicitó cotización con entrega en Quintana Roo. 3. Valor proyectado: ${formatMoney(opportunity.value)}, etapa actual: ${STAGE_LABEL[opportunity.stage]}.`;
    } else if (q.includes('siguiente paso') || q.includes('paso')) {
      response = 'Siguiente paso prioritario: Enviar cotización formal con costos de flete a Playa del Carmen y coordinar llamada de confirmación con Diego.';
    } else if (q.includes('hace cuánto') || q.includes('respondemos')) {
      response = 'Última actividad registrada fue hace aproximadamente 12 minutos. El tiempo promedio de respuesta del equipo está dentro de los rangos óptimos.';
    } else if (q.includes('seguimiento') || q.includes('redactar')) {
      response = `"Hola ${contact?.name || 'Cliente'}, buen día. Te comparto la información detallada del acabado exterior y costos de envío. ¿Te gustaría que agendemos la entrega para esta misma semana?"`;
    } else {
      response = `Análisis de la oportunidad "${opportunity.name}": asignada a ${opportunity.rep}, en etapa ${STAGE_LABEL[opportunity.stage]} por ${formatMoney(opportunity.value)}. Se recomienda dar seguimiento activo.`;
    }

    setAiAnswer(response);
    onShowToast(`IA: "${question}" — respuesta generada con base en las notas`);
    setAiQuestion('');
  };

  return (
    <section id="view-opp-detail" className="view active">
      <div className="back-link" onClick={onBack} id="btn-back-opps">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Oportunidades
      </div>

      <div className="detail-head" id="opp-detail-head">
        <div className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 id="odt-name">{opportunity.name}</h1>
          <span className={`stage ${opportunity.stage}`}>
            <span className="dot"></span>
            {STAGE_LABEL[opportunity.stage]}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          id="btn-edit-opp"
          onClick={() => setIsEditModalOpen(true)}
          title="Editar oportunidad"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Editar</span>
        </button>
      </div>

      <div className="detail-title" style={{ marginBottom: '14px' }}>
        {contact ? (
          <span
            className="sub-link"
            id="odt-contact-link"
            onClick={() => onSelectLead(contact.id)}
          >
            Contacto: {contact.name} {contact.company ? `— ${contact.company}` : ''}
          </span>
        ) : (
          <span className="sub-link" id="odt-contact-link">
            Sin contacto asociado
          </span>
        )}
      </div>

      <div className="stepper" id="opp-stepper">
        {STAGE_CONFIG.map(st => (
          <button
            key={st.key}
            className={`step ${opportunity.stage === st.key ? 'active' : ''}`}
            data-stage={st.key}
            onClick={() => handleStageClick(st.key)}
          >
            {st.label}
          </button>
        ))}
      </div>

      <div className="detail-grid" id="opp-detail-grid">
        <div>
          <div className="card" id="card-opp-details">
            <div className="card-head">
              <div className="htitle">
                <h3>Detalles</h3>
              </div>
            </div>
            <div className="field-list">
              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                <div className="ftext">
                  <div className="k">Cliente asociado</div>
                  <div
                    className={`v ${contact ? 'link' : 'empty'}`}
                    id="odt-contact"
                    onClick={() => contact && onSelectLead(contact.id)}
                  >
                    {contact ? contact.name : 'Sin contacto'}
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <div className="ftext">
                  <div className="k">Rep asignado</div>
                  <div className="v" id="odt-rep" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserAvatar name={opportunity.rep} size="xs" />
                    <span>{opportunity.rep}</span>
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <div className="ftext">
                  <div className="k">Valor estimado</div>
                  <div className="v" id="odt-value">{formatMoney(opportunity.value)}</div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <div className="ftext">
                  <div className="k">Fecha estimada de cierre</div>
                  <div className="v" id="odt-close">{opportunity.close || '—'}</div>
                </div>
              </div>

              {opportunity.stage === 'perdido' && opportunity.lostReason && (
                <div className="field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <div className="ftext">
                    <div className="k">Motivo de pérdida</div>
                    <div className="v" id="odt-lost-reason" style={{ color: 'var(--crit)' }}>
                      {opportunity.lostReason}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refined "Suggested Response" Section with Open Text Input for Client's Message */}
          <div className="card" id="card-opp-suggestion">
            <div className="card-head">
              <div className="htitle">
                <h3>Sugerencia de respuesta</h3>
              </div>
              <span className="tag-ai">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                </svg>
                IA &middot; Asistente de mensajes
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--ink-500)', marginBottom: '10px' }}>
              Pega el mensaje o duda que te envió el cliente para que la IA redacte una propuesta de respuesta ajustada al contexto comercial de esta oportunidad.
            </p>

            {/* 1. Open Text Input Field for Client's Message */}
            <div className="client-input-wrapper">
              <textarea
                className="client-msg-textarea"
                id="client-message-input"
                rows={3}
                placeholder="Pega aquí el mensaje del cliente (ej. '¿Cuánto tardaría el envío y qué costo total tiene?')..."
                value={clientMessage}
                onChange={e => setClientMessage(e.target.value)}
              />

              {/* Action Toolbar */}
              <div className="client-msg-toolbar">
                <div style={{ fontSize: '11.5px', color: 'var(--ink-500)' }}>
                  {clientMessage.trim() ? `${clientMessage.length} caracteres` : 'Escribe o pega el texto recibido'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {clientMessage.trim() && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setClientMessage('');
                        setSuggestedResponse(null);
                        setIsEditingResponse(false);
                      }}
                    >
                      Limpiar
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    id="btn-generate-ai-response"
                    disabled={!clientMessage.trim() || isGenerating}
                    onClick={() => handleGenerateResponse(clientMessage)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                    </svg>
                    <span>{isGenerating ? 'Generando respuesta...' : 'Generar respuesta con IA'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Display Generated Response with Review, Edit, Copy and Regenerate */}
            {suggestedResponse && (
              <div className="suggestion-box highlight" id="suggestion-container">
                <div className="suggestion-header">
                  <span className="suggestion-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                    </svg>
                    Respuesta sugerida por IA
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>
                    {isEditingResponse ? 'Editando mensaje' : 'Revisión requerida'}
                  </span>
                </div>

                {isEditingResponse ? (
                  <div style={{ marginTop: '6px' }}>
                    <textarea
                      className="suggestion-edit-textarea"
                      value={editableResponseText}
                      onChange={e => setEditableResponseText(e.target.value)}
                      rows={4}
                      autoFocus
                      placeholder="Edita la respuesta antes de enviarla..."
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditableResponseText(suggestedResponse);
                          setIsEditingResponse(false);
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (editableResponseText.trim()) {
                            setSuggestedResponse(editableResponseText.trim());
                            setIsEditingResponse(false);
                            onShowToast('Respuesta editada guardada');
                          }
                        }}
                      >
                        Guardar edición
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="suggestion-text-content" id="suggestion-text">
                      {suggestedResponse}
                    </div>

                    <div className="suggestion-actions" style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        id="btn-copy-suggestion"
                        onClick={handleCopySuggestion}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copiar mensaje</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        id="btn-edit-suggestion"
                        onClick={() => {
                          setEditableResponseText(suggestedResponse);
                          setIsEditingResponse(true);
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        id="btn-regenerate-suggestion"
                        onClick={handleRegenerateSuggestion}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>Regenerar variante</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section: Notes with File Attachments & Edit/Delete */}
          <NotesAndFiles
            currentUserName={currentUserName}
            notes={notes}
            contactId={opportunity.contactId}
            fixedOpportunityId={opportunity.id}
            relatedOpportunities={[opportunity]}
            onAddNote={handleAddNoteWithTimeline}
            onUpdateNote={onUpdateNote}
            onDeleteNote={handleDeleteNoteWithTimeline}
            onNavigateToOpportunity={onSelectOpportunity}
            onShowToast={onShowToast}
          />
        </div>

        <div>
          <div className="card ai-tint" id="card-opp-ai-ask">
            <div className="card-head">
              <div className="htitle">
                <h3>Preguntar sobre esta oportunidad</h3>
              </div>
              <span className="tag-ai">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                </svg>
                IA
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-500)', marginBottom: '12px' }}>
              La IA tiene acceso a las notas, archivos y línea de tiempo de esta oportunidad.
            </p>
            <div className="ask-chip-grid">
              <div className="chip" onClick={() => handleAskAI('Resumir en 3 puntos')}>
                Resumir en 3 puntos
              </div>
              <div className="chip" onClick={() => handleAskAI('¿Cuál es el siguiente paso?')}>
                ¿Cuál es el siguiente paso?
              </div>
              <div className="chip" onClick={() => handleAskAI('¿Hace cuánto no respondemos?')}>
                ¿Hace cuánto no respondemos?
              </div>
              <div className="chip" onClick={() => handleAskAI('Redactar mensaje de seguimiento')}>
                Redactar mensaje de seguimiento
              </div>
            </div>

            {aiAnswer && (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--accent-soft-2)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 12px',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  color: 'var(--ink-800)',
                  marginBottom: '12px'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>
                  Respuesta de IA:
                </div>
                {aiAnswer}
              </div>
            )}

            <div className="ask-input-row">
              <input
                type="text"
                id="ask-input"
                placeholder="Escribe tu pregunta..."
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAskAI(aiQuestion);
                }}
              />
              <button
                className="ask-send"
                onClick={() => handleAskAI(aiQuestion)}
                title="Enviar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="card" id="card-opp-timeline">
            <div className="card-head">
              <div className="htitle">
                <h3>Línea de tiempo</h3>
              </div>
            </div>
            <div className="activity-list" id="opp-timeline-list">
              {timelineEvents.map(evt => (
                <div className="activity-item" key={evt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <UserAvatar
                    name={evt.author}
                    type={evt.type}
                    initials={evt.initial}
                    avatarUrl={evt.avatarUrl}
                    size="sm"
                  />
                  <div>
                    <b>{evt.author}</b> {evt.action}
                    <span className="when">{evt.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Confirmación de Oportunidad Ganada (CAMBIO 1) */}
      <Dialog
        isOpen={showWonModal}
        id="modal-won-opp-card"
        title="Marcar como ganada"
        subtitle={`Registrá el cierre de ${opportunity.name}.`}
        width="520px"
        onClose={() => setShowWonModal(false)}
        onSubmit={handleConfirmWon}
        formId="form-won-opp"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowWonModal(false)}
              id="btn-cancel-won-modal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-confirm-won"
              style={{ background: 'var(--good)', borderColor: 'var(--good)', color: 'var(--paper)' }}
            >
              Marcar como ganada
            </button>
          </>
        }
      >
        {/* Only asks for what's actually still missing. */}
        {!hasValidValue(opportunity.value) && (
          <FormField label="Valor cerrado" htmlFor="won-modal-value" required error={wonErrors.value}>
            <input
              type="text"
              inputMode="decimal"
              id="won-modal-value"
              data-autofocus
              placeholder="$0.00"
              value={wonValue}
              onChange={e => {
                setWonValue(e.target.value);
                if (wonErrors.value) setWonErrors(prev => ({ ...prev, value: undefined }));
              }}
            />
          </FormField>
        )}

        {!hasValidClose(opportunity.close) && (
          <FormField label="Fecha de cierre" htmlFor="won-modal-close" required error={wonErrors.close}>
            <input
              type="date"
              id="won-modal-close"
              value={wonClose}
              onChange={e => {
                setWonClose(e.target.value);
                if (wonErrors.close) setWonErrors(prev => ({ ...prev, close: undefined }));
              }}
            />
          </FormField>
        )}

        {hasValidValue(opportunity.value) && hasValidClose(opportunity.close) && (
          <p style={{ fontSize: '14px', color: 'var(--ink-700)', lineHeight: 1.5, margin: '4px 0' }}>
            Ya tiene valor y fecha de cierre registrados. Solo falta confirmar.
          </p>
        )}
      </Dialog>

      {/* Modal: Motivo de pérdida obligatorio (CAMBIO 2) */}
      <Dialog
        isOpen={showLostModal}
        id="modal-lost-opp-card"
        title="Marcar como perdida"
        subtitle={`Dejá registro de por qué no se concretó ${opportunity.name}.`}
        width="520px"
        onClose={() => setShowLostModal(false)}
        onSubmit={handleConfirmLost}
        formId="form-lost-opp"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowLostModal(false)}
              id="btn-cancel-lost-modal"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" id="btn-confirm-lost">
              Marcar como perdida
            </button>
          </>
        }
      >
        <FormField
          label="Motivo de pérdida"
          htmlFor="lost-modal-reason"
          required
          hint="Sirve para entender qué mejorar en próximas negociaciones."
          error={lostReasonError}
        >
          <textarea
            id="lost-modal-reason"
            rows={4}
            data-autofocus
            placeholder="Ej. Eligió a la competencia por precio."
            value={lostReason}
            onChange={e => {
              setLostReason(e.target.value);
              if (lostReasonError) setLostReasonError('');
            }}
          />
        </FormField>
      </Dialog>

      {/* Edit Opportunity Modal */}
      {isEditModalOpen && (
        <EditOpportunityModal
          isOpen={isEditModalOpen}
          opportunity={opportunity}
          contacts={contacts.length > 0 ? contacts : (contact ? [contact] : [])}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveOpportunity}
        />
      )}

    </section>
  );
};
