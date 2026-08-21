import React, { useState } from 'react';
import { Contact, Opportunity, NoteItem } from '../types';
import { STAGE_LABEL, formatMoney, getOpportunityColorIndex } from '../data/initialData';
import { UserAvatar } from './UserAvatar';
import { CreateOpportunityDrawer } from './CreateOpportunityDrawer';
import { EditLeadModal } from './EditLeadModal';
import { ConfirmDialog } from './ConfirmDialog';
import { NotesAndFiles } from './NotesAndFiles';
import { getOriginBadgeClass, getOriginDisplayName } from './LeadsView';

interface LeadDetailViewProps {
  contact: Contact;
  opportunities: Opportunity[];
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
  onUpdateNote: (noteId: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (noteId: string) => void;
  onBack: () => void;
  onSelectOpportunity: (oppId: number) => void;
  onOpenNewOppModal?: (contactId: number) => void;
  onCreateOpportunity?: (newOpp: Partial<Opportunity>) => void;
  onUpdateLead?: (leadId: number, updatedFields: Partial<Contact>) => void;
  onToggleHot: (contactId: number) => void;
  onShowToast: (msg: string) => void;
}


export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  contact,
  opportunities,
  notes: allNotes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onBack,
  onSelectOpportunity,
  onOpenNewOppModal,
  onCreateOpportunity,
  onUpdateLead,
  onToggleHot,
  onShowToast
}) => {
  // Contact view shows every note that belongs to this contact, whether
  // it's contact-level or tagged to one of the contact's own opportunities.
  const notes = allNotes.filter(n => n.contactId === contact.id);

  // Lead Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Opportunity Drawer state
  const [isCreateOppDrawerOpen, setIsCreateOppDrawerOpen] = useState(false);

  // AI assistant state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const relatedOpps = opportunities.filter(o => o.contactId === contact.id);
  const openOpps = relatedOpps.filter(o => o.stage !== 'ganado' && o.stage !== 'perdido');
  const wonOpps = relatedOpps.filter(o => o.stage === 'ganado');
  const totalOpenValue = openOpps.reduce((sum, o) => sum + (o.value || 0), 0);
  const totalWonValue = wonOpps.reduce((sum, o) => sum + (o.value || 0), 0);

  // Opportunity drawer handler
  const handleOpenCreateOpp = () => {
    setIsCreateOppDrawerOpen(true);
  };

  const handleCreateOppSubmit = (newOppData: Partial<Opportunity>) => {
    if (onCreateOpportunity) {
      onCreateOpportunity(newOppData);
    } else if (onOpenNewOppModal) {
      onOpenNewOppModal(contact.id);
    }
  };

  const handleExecuteAIAction = (actionType: string) => {
    let answer = '';
    switch (actionType) {
      case 'summarize':
        answer = `📋 **Resumen del Contacto**: ${contact.name} ${contact.company ? `(${contact.company})` : ''} es un prospecto de ${contact.region || 'México'} en el sector ${contact.giro || 'Comercial'}. Cuenta con ${openOpps.length} oportunidad(es) abierta(s) valoradas en ${formatMoney(totalOpenValue)}.`;
        break;

      case 'next_step':
        if (openOpps.length > 0) {
          answer = `🎯 **Siguiente paso recomendado**: La oportunidad "${openOpps[0].name}" está en etapa "${STAGE_LABEL[openOpps[0].stage]}" (Rep: ${openOpps[0].rep}). Se recomienda dar seguimiento para concretar la propuesta formal antes de la fecha estimada de cierre.`;
        } else {
          answer = `🚀 **Siguiente paso recomendado**: Crear una oportunidad comercial calificada y agendar una llamada de exploración de requerimientos técnicos y presupuesto.`;
        }
        break;

      case 'purchase_history':
        if (wonOpps.length > 0) {
          answer = `💰 **Historial de compras**: ${contact.name} tiene ${wonOpps.length} compra(s) ganada(s) por un total acumulado de ${formatMoney(totalWonValue)}. Proyectos: ${wonOpps.map(o => `"${o.name}" (${formatMoney(o.value)})`).join(', ')}.`;
        } else {
          answer = `📊 **Historial de compras**: No se registran compras históricas cerradas aún. Actualmente tiene ${openOpps.length} oportunidad(es) en curso.`;
        }
        break;

      case 'open_opps':
        if (openOpps.length > 0) {
          answer = `📂 **Oportunidades abiertas**: ${openOpps.map(o => `• ${o.name} — Etapa: ${STAGE_LABEL[o.stage]} — Valor: ${formatMoney(o.value)} (Rep: ${o.rep})`).join('\n')}`;
        } else {
          answer = '📁 **Oportunidades abiertas**: No tiene oportunidades abiertas en este momento.';
        }
        break;

      case 'draft_followup':
        answer = `✍️ **Borrador de seguimiento sugerido**:\n\n"Hola ${contact.name.split(' ')[0]}, espero que estés muy bien. Te contacto para dar seguimiento a los requerimientos de ${contact.company || contact.giro || 'su proyecto'}. Con gusto podemos revisar detalles de entrega y cotización formal cuando te sea más conveniente. ¡Quedo a tus órdenes!"`;
        break;

      default:
        answer = `Información comercial actualizada para ${contact.name}.`;
    }

    setAiAnswer(answer);
    onShowToast('IA: Acción ejecutada');
  };

  const handleAskAI = (question: string) => {
    if (!question.trim()) return;
    const q = question.toLowerCase();

    if (q.includes('resumen') || q.includes('summarize')) {
      handleExecuteAIAction('summarize');
      return;
    } else if (q.includes('siguiente') || q.includes('next') || q.includes('hacer')) {
      handleExecuteAIAction('next_step');
      return;
    } else if (q.includes('compra') || q.includes('historial') || q.includes('history')) {
      handleExecuteAIAction('purchase_history');
      return;
    } else if (q.includes('oportunidad') || q.includes('opp')) {
      handleExecuteAIAction('open_opps');
      return;
    } else if (q.includes('mensaje') || q.includes('correo') || q.includes('whatsapp') || q.includes('draft')) {
      handleExecuteAIAction('draft_followup');
      return;
    } else {
      const answer = `Con base en los datos de ${contact.name} (${contact.giro || 'General'}), el prospecto cuenta con ${openOpps.length} oportunidad(es) activa(s) y última actividad registrada "${contact.last}".`;
      setAiAnswer(answer);
      onShowToast('IA: Respuesta generada');
      setAiQuestion('');
    }
  };

  const originName =
    contact.src === 'retail'
      ? 'Retail'
      : contact.src === 'b2b'
      ? 'B2B'
      : contact.src === 'online'
      ? 'Online'
      : contact.src === 'referral'
      ? (contact.referredBy ? `Referido (por ${contact.referredBy})` : 'Referido')
      : contact.src === 'ig'
      ? 'Instagram'
      : contact.src === 'wa'
      ? 'WhatsApp'
      : contact.src === 'fb'
      ? 'Facebook'
      : contact.src === 'tt'
      ? 'TikTok'
      : 'Manual';

  return (
    <section id="view-lead-detail" className="view active">
      {/* Back button */}
      <div className="back-link" onClick={onBack} id="btn-back-leads">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Contactos
      </div>

      {/* Header with Hierarchy & Requested Action Button Row: Prioritario, Editar, Crear oportunidad */}
      <div className="detail-head" id="lead-detail-header">
        <div className="detail-title" style={{ flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 id="dt-name">
                {contact.name}
                {contact.company ? ` — ${contact.company}` : ''}
              </h1>
              {contact.hot && (
                <span className="priority-badge-pill" id="badge-lead-priority" title="Contacto prioritario de alta atención">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Prioritario
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: 'var(--ink-500)' }}>
              {/* Same origin pill the Contactos list uses, via the shared
                  helpers — replaces a 20px square that also repeated the
                  origin name in the span right after it. */}
              <span
                className={`origin-badge origin-badge-${getOriginBadgeClass(contact.src, contact.srcLabel)}`}
                title={`Origen: ${getOriginDisplayName(contact.src, contact.srcLabel)}`}
              >
                {getOriginDisplayName(contact.src, contact.srcLabel)}
              </span>
              {contact.giro && (
                <>
                  <span>&middot;</span>
                  <span>{contact.giro}</span>
                </>
              )}
              {contact.region && (
                <>
                  <span>&middot;</span>
                  <span>{contact.region}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="head-actions">
          {/* 1. Prioritario Button */}
          <button
            type="button"
            className={`btn btn-sm btn-priority-toggle ${contact.hot ? 'active' : ''}`}
            id="hot-btn"
            onClick={() => {
              onToggleHot(contact.id);
              onShowToast(contact.hot ? 'Se quitó la marca de prioridad del contacto' : '★ Contacto marcado como prioritario');
            }}
            title={contact.hot ? 'Quitar marca de prioritario' : 'Marcar contacto como prioritario'}
            aria-label={contact.hot ? 'Quitar marca de prioritario' : 'Marcar contacto como prioritario'}
            aria-pressed={contact.hot}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={contact.hot ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={contact.hot ? '1.5' : '2'}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Prioritario</span>
          </button>

          {/* 2. Editar Button */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsEditModalOpen(true)}
            id="btn-edit-lead"
            title="Editar información del contacto"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Editar</span>
          </button>

          {/* 3. Crear oportunidad Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            id="btn-create-opp-from-lead"
            onClick={handleOpenCreateOpp}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Crear oportunidad</span>
          </button>
        </div>
      </div>

      <div className="detail-grid" id="lead-detail-grid">
        {/* Left Column: Contact info & Notes */}
        <div>
          {/* Section 1: Contact Information */}
          <div className="card" id="card-lead-contact-info">
            <div className="section-card-head">
              <h4>Información de contacto</h4>
              <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>ID #{contact.id}</span>
            </div>

            <div className="field-list">
              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" />
                </svg>
                <div className="ftext">
                  <div className="k">Teléfono</div>
                  <div className="v" id="dt-phone">{contact.phone || '—'}</div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 6 10 7 10-7" />
                </svg>
                <div className="ftext">
                  <div className="k">Correo electrónico</div>
                  <div className="v" id="dt-email">{contact.email || '—'}</div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="ftext">
                  <div className="k">Ubicación / Región</div>
                  <div className="v" id="dt-region">{contact.region || '—'}</div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <div className="ftext">
                  <div className="k">Tipo de cuenta</div>
                  <div className="v" id="dt-type">{contact.type || (contact.company ? 'Empresa / B2B' : 'Particular')}</div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="14" rx="1.5" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <div className="ftext">
                  <div className="k">Giro / Industria</div>
                  <div className={`v ${contact.giro ? '' : 'empty'}`} id="dt-giro">
                    {contact.giro || 'Sin especificar'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NotesAndFiles
            notes={notes}
            contactId={contact.id}
            relatedOpportunities={relatedOpps}
            onAddNote={onAddNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onNavigateToOpportunity={onSelectOpportunity}
            onShowToast={onShowToast}
          />
        </div>

        {/* Right Column: Sales context, Related Opportunities, AI Assistant */}
        <div>
          {/* Section 3: Commercial Context (No Lead Score, No Lead Owner) */}
          <div className="card" id="card-lead-sales-context">
            <div className="section-card-head">
              <h4>Contexto comercial</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Opportunities & Pipeline Summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
                    Pipeline total
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--good)', marginTop: '2px' }}>
                    {formatMoney(totalOpenValue)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
                    Oportunidades
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)', marginTop: '2px' }}>
                    {openOpps.length} abiertas &middot; {wonOpps.length} ganadas
                  </div>
                </div>
              </div>

              {/* Last Activity */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border-soft)' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
                    Última actividad
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-900)', marginTop: '2px' }}>
                    {contact.last || 'Reciente'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Related Opportunities (Displays assigned rep per opportunity) */}
          <div className="card" id="card-lead-related-opps">
            <div className="section-card-head">
              <h4>Oportunidades relacionadas</h4>
              <button
                className="btn btn-ghost btn-sm"
                id="btn-add-opp-from-section"
                onClick={handleOpenCreateOpp}
              >
                + Nueva
              </button>
            </div>

            <div id="dt-related-opps">
              {relatedOpps.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '24px 16px', margin: '4px 0' }}>
                  <div className="empty-state-icon" style={{ width: '36px', height: '36px', marginBottom: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div className="empty-state-title" style={{ fontSize: '13.5px' }}>
                    Sin oportunidades aún
                  </div>
                  <div className="empty-state-desc" style={{ fontSize: '12px', marginBottom: '12px' }}>
                    Este contacto no tiene proyectos u oportunidades comerciales registradas.
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenCreateOpp}
                  >
                    Crear oportunidad
                  </button>
                </div>
              ) : (
                relatedOpps.map(o => (
                  <div
                    className="related-opp-row"
                    key={o.id}
                    onClick={() => onSelectOpportunity(o.id)}
                  >
                    <div>
                      <div className="lead-name" style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                        <span className={`related-opp-color-dot opp-color-${getOpportunityColorIndex(relatedOpps, o.id)}`}></span>
                        {o.name}
                      </div>
                      <div className="lead-sub">Rep: {o.rep} &middot; Cierre: {o.close || '—'}</div>
                    </div>
                    <div className="related-opp-right">
                      <span className={`stage ${o.stage}`}>
                        <span className="dot"></span>
                        {STAGE_LABEL[o.stage]}
                      </span>
                      <span className={`opp-value ${o.value == null ? 'empty' : ''}`}>
                        {formatMoney(o.value)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Executive Summary */}
          <div className="card ai-tint" id="card-lead-exec-summary">
            <div className="card-head">
              <div className="htitle">
                <h3>Resumen ejecutivo</h3>
              </div>
              <span className="tag-ai">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                </svg>
                a solicitud
              </span>
            </div>
            <div className="exec-summary">
              <div className="ts">Generado hoy &middot; Síntesis comercial</div>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>
                {contact.name} {contact.company ? `(${contact.company})` : ''} ingresó por <b>{originName}</b> {contact.last ? `(última interacción: ${contact.last})` : ''} en la región de <b>{contact.region || 'México'}</b>{contact.giro ? ` en el sector ${contact.giro}` : ''}.
              </p>
              {openOpps.length > 0 ? (
                <p style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>
                  Cuenta actualmente con <b>{openOpps.length} oportunidad(es) activa(s)</b> valoradas en <b>{formatMoney(totalOpenValue)}</b>. Proyecto principal: <i>"{openOpps[0].name}"</i> en etapa <b>{STAGE_LABEL[openOpps[0].stage]}</b> (Rep asignado: {openOpps[0].rep}).
                </p>
              ) : (
                <p style={{ margin: '0 0 8px 0', color: 'var(--ink-600)', lineHeight: '1.6' }}>
                  No registra oportunidades abiertas en curso en el pipeline comercial.
                </p>
              )}
              <div className="exec-next-action">
                <span className="exec-next-action-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
                  </svg>
                </span>
                <div className="exec-next-action-body">
                  <div className="exec-next-action-label">Siguiente acción recomendada</div>
                  <p className="exec-next-action-text">
                    {openOpps.length > 0
                      ? `Dar seguimiento activo con ${openOpps[0].rep} para enviar cotización y propuesta formal antes de la fecha límite.`
                      : `Iniciar contacto para calificación comercial y agendar una llamada de exploración de requerimientos.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: AI Assistant */}
          <div className="card ai-tint" id="card-lead-ai">
            <div className="card-head">
              <div className="htitle">
                <h3>Asistente de IA</h3>
              </div>
              <span className="tag-ai">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z" />
                </svg>
                IA
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--ink-500)', marginBottom: '12px' }}>
              Acciones sugeridas y análisis inteligente del historial de este lead.
            </p>

            {/* AI Predefined Action Buttons */}
            <div className="ai-actions-grid">
              <button
                className="ai-action-btn"
                onClick={() => handleExecuteAIAction('summarize')}
                title="Resumen integral del contacto y sus negociaciones"
              >
                📋 Resumir lead
              </button>

              <button
                className="ai-action-btn"
                onClick={() => handleExecuteAIAction('next_step')}
                title="Recomendación táctica para el seguimiento"
              >
                🎯 ¿Qué debería hacer después?
              </button>

              <button
                className="ai-action-btn"
                onClick={() => handleExecuteAIAction('purchase_history')}
                title="Historial de compras ganadas y volumen facturado"
              >
                💰 Ver historial de compras
              </button>

              <button
                className="ai-action-btn"
                onClick={() => handleExecuteAIAction('open_opps')}
                title="Detalle de oportunidades en curso"
              >
                📂 Buscar oportunidades abiertas
              </button>

              <button
                className="ai-action-btn"
                onClick={() => handleExecuteAIAction('draft_followup')}
                title="Generar borrador de mensaje para el cliente"
              >
                ✍️ Redactar seguimiento
              </button>
            </div>

            {aiAnswer && (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--accent-soft-2)',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  color: 'var(--ink-800)',
                  marginBottom: '12px',
                  whiteSpace: 'pre-line'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>
                  Respuesta de AI Assistant:
                </div>
                {aiAnswer}
              </div>
            )}

            {/* Freeform Question Row */}
            <div className="ask-input-row">
              <input
                type="text"
                id="ask-input-lead"
                placeholder="Escribe tu pregunta o solicitud..."
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAskAI(aiQuestion);
                }}
              />
              <button
                className="ask-send"
                onClick={() => handleAskAI(aiQuestion)}
                title="Preguntar a la IA"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Opportunity Right-Side Drawer */}
      <CreateOpportunityDrawer
        isOpen={isCreateOppDrawerOpen}
        contact={contact}
        onClose={() => setIsCreateOppDrawerOpen(false)}
        onCreateOpportunity={handleCreateOppSubmit}
        onShowToast={onShowToast}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        contact={contact}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(leadId, updatedFields) => {
          if (onUpdateLead) {
            onUpdateLead(leadId, updatedFields);
          }
        }}
      />
    </section>
  );
};
