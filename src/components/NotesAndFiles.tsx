import React, { useEffect, useRef, useState } from 'react';
import { NoteItem, NoteAttachment, Opportunity } from '../types';
import { isNoteEditable, formatNoteRemainingTime, getOpportunityColorIndex } from '../data/initialData';
import { UserAvatar } from './UserAvatar';
import { ConfirmDialog } from './ConfirmDialog';
import { SearchableSelect } from './SearchableSelect';


function getAttachmentType(fileName: string): NoteAttachment['type'] {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

interface NotesAndFilesProps {
  /** Already scoped by the caller: every note for a contact, or only the
   *  notes tagged to one specific opportunity. This component doesn't
   *  re-derive that scope, only (in contact mode) offers a lighter filter
   *  on top of it. */
  notes: NoteItem[];
  contactId: number;
  /** Set only from an Opportunity detail view. When present, the
   *  opportunity tag selector and the contact-mode filter are both hidden,
   *  and every new note is tagged with this id automatically — the context
   *  already answers "which opportunity", so there's nothing to ask the
   *  user. */
  fixedOpportunityId?: number;
  /** The contact's opportunities, used to (a) populate the composer's
   *  optional tag selector in contact mode, (b) resolve an opportunity id
   *  to its display name for the tag pill, and (c) populate the
   *  contact-mode filter dropdown. In opportunity mode, callers only need
   *  to pass that one opportunity (for name lookup on the tag). */
  relatedOpportunities: Opportunity[];
  onAddNote: (note: NoteItem) => void;
  onUpdateNote: (noteId: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (noteId: string) => void;
  /** Tag click target — takes the user to that opportunity's own detail
   *  view, reinforcing that notes are one shared list, not two. */
  onNavigateToOpportunity: (oppId: number) => void;
  onShowToast: (msg: string) => void;
  /** Who is writing. Was a module constant naming the only Manager; he now
   *  administers the platform, so notes have to be attributed to the session. */
  currentUserName: string;
}

/**
 * The one Notes & Files system, used identically from the Contact detail
 * view (every note for that contact, general and opportunity-tagged alike)
 * and from an Opportunity detail view (only that opportunity's notes, new
 * ones auto-tagged). Previously each view hand-rolled its own near-copy of
 * this — same markup, same handlers, drifting title and composer copy —
 * which is exactly the "two systems" this component replaces.
 */
export const NotesAndFiles: React.FC<NotesAndFilesProps> = ({
  notes,
  contactId,
  fixedOpportunityId,
  relatedOpportunities,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onNavigateToOpportunity,
  onShowToast,
  currentUserName
}) => {
  const isOpportunityScoped = fixedOpportunityId != null;

  const [noteText, setNoteText] = useState('');
  const [noteOppId, setNoteOppId] = useState<number | ''>('');
  const [pendingAttachments, setPendingAttachments] = useState<NoteAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [openMenuNoteId, setOpenMenuNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [editingAttachments, setEditingAttachments] = useState<NoteAttachment[]>([]);
  const [deletingNote, setDeletingNote] = useState<NoteItem | null>(null);
  const noteMenuRef = useRef<HTMLDivElement | null>(null);

  // Contact-mode-only quick filter over the already-merged note list. A
  // searchable dropdown scales to any number of opportunities, unlike the
  // pill row it replaced.
  const [filterOppId, setFilterOppId] = useState('');

  // The edit-window policy banner is dismissible and, once dismissed, stays
  // that way across visits (persisted in localStorage) rather than re-nagging
  // the user every time they open this section. It stays reachable afterward
  // through the small "?" toggle next to the section title.
  const [isPolicyBannerDismissed, setIsPolicyBannerDismissed] = useState(
    () => localStorage.getItem('notes-policy-banner-dismissed') === 'true'
  );
  const [isPolicyPopoverOpen, setIsPolicyPopoverOpen] = useState(false);
  const policyPopoverRef = useRef<HTMLDivElement | null>(null);

  const dismissPolicyBanner = () => {
    setIsPolicyBannerDismissed(true);
    localStorage.setItem('notes-policy-banner-dismissed', 'true');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuNoteId && noteMenuRef.current && !noteMenuRef.current.contains(e.target as Node)) {
        setOpenMenuNoteId(null);
      }
      if (isPolicyPopoverOpen && policyPopoverRef.current && !policyPopoverRef.current.contains(e.target as Node)) {
        setIsPolicyPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuNoteId, isPolicyPopoverOpen]);

  const visibleNotes = isOpportunityScoped
    ? notes
    : filterOppId === ''
    ? notes
    : filterOppId === 'general'
    ? notes.filter(n => n.opportunityId == null)
    : notes.filter(n => n.opportunityId === Number(filterOppId));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const newAttachments: NoteAttachment[] = fileList.map((file: File, idx: number) => ({
      id: `att-${Date.now()}-${idx}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: getAttachmentType(file.name)
    }));

    if (isEditMode) {
      setEditingAttachments(prev => [...prev, ...newAttachments]);
    } else {
      setPendingAttachments(prev => [...prev, ...newAttachments]);
    }

    onShowToast(`${newAttachments.length} archivo(s) adjunto(s)`);
    e.target.value = '';
  };

  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleRemoveEditingAttachment = (id: string) => {
    setEditingAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleAddNote = () => {
    if (!noteText.trim() && pendingAttachments.length === 0) return;
    const now = Date.now();
    const newNote: NoteItem = {
      id: 'note-' + now,
      contactId,
      opportunityId: isOpportunityScoped ? fixedOpportunityId : noteOppId === '' ? undefined : noteOppId,
      author: currentUserName,
      initials: 'EM',
      time: 'justo ahora',
      createdAtTimestamp: now,
      text: noteText.trim(),
      avatarBg: 'var(--accent)',
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };
    onAddNote(newNote);
    setNoteText('');
    setNoteOppId('');
    setPendingAttachments([]);
    onShowToast('Nota guardada con éxito. Tienes 24 horas para editarla o eliminarla.');
  };

  const handleStartEditNote = (note: NoteItem) => {
    if (!isNoteEditable(note)) {
      onShowToast('El tiempo límite de 24 horas para editar esta nota ha expirado');
      setOpenMenuNoteId(null);
      return;
    }
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
    setEditingAttachments(note.attachments ? [...note.attachments] : []);
    setOpenMenuNoteId(null);
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!editingNoteText.trim() && editingAttachments.length === 0) return;
    const targetNote = notes.find(n => n.id === noteId);
    if (targetNote && !isNoteEditable(targetNote)) {
      onShowToast('El tiempo límite de 24 horas para editar esta nota ha expirado');
      setEditingNoteId(null);
      return;
    }
    onUpdateNote(noteId, {
      text: editingNoteText.trim(),
      attachments: editingAttachments.length > 0 ? editingAttachments : undefined,
      isEdited: true,
      updatedAt: 'justo ahora'
    });
    setEditingNoteId(null);
    setEditingNoteText('');
    setEditingAttachments([]);
    onShowToast('Nota actualizada');
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
    setEditingAttachments([]);
  };

  const handlePromptDeleteNote = (note: NoteItem) => {
    if (!isNoteEditable(note)) {
      onShowToast('El tiempo límite de 24 horas para eliminar esta nota ha expirado');
      setOpenMenuNoteId(null);
      return;
    }
    setDeletingNote(note);
    setOpenMenuNoteId(null);
  };

  const handleConfirmDeleteNote = () => {
    if (!deletingNote) return;
    if (!isNoteEditable(deletingNote)) {
      onShowToast('El tiempo límite de 24 horas para eliminar esta nota ha expirado');
      setDeletingNote(null);
      return;
    }
    onDeleteNote(deletingNote.id);
    setDeletingNote(null);
    onShowToast('Nota eliminada');
  };

  return (
    <>
      <div className="card" id="card-notes-and-files">
        <div className="section-card-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4>Notas y archivos</h4>
            <div className="notes-policy-info-wrap" ref={policyPopoverRef}>
              <button
                type="button"
                className={`notes-policy-info-btn ${isPolicyPopoverOpen ? 'active' : ''}`}
                onClick={() => setIsPolicyPopoverOpen(prev => !prev)}
                title="Política de edición de notas"
                aria-label="Ver política de edición de notas"
              >
                ?
              </button>
              {isPolicyPopoverOpen && (
                <div className="notes-policy-popover" role="tooltip">
                  Podrás editar o eliminar una nota únicamente durante las primeras 24 horas post creación.
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>{notes.length} notas</span>
        </div>

        {/* Note Composer */}
        <textarea
          className="note-input"
          id="notes-and-files-input"
          placeholder="Escribe notas de reuniones, llamadas, cotizaciones o acuerdos con el cliente..."
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
        ></textarea>

        {/* Pending Attachments List */}
        {pendingAttachments.length > 0 && (
          <div className="note-pending-attachments" id="pending-attachments-container">
            {pendingAttachments.map(att => (
              <span key={att.id} className="note-attachment-chip">
                <span className={`att-icon ${att.type}`}>{att.type}</span>
                <span>{att.name}</span>
                <span style={{ fontSize: '10.5px', color: 'var(--ink-500)' }}>({att.size})</span>
                <button
                  type="button"
                  className="att-remove"
                  onClick={() => handleRemovePendingAttachment(att.id)}
                  title="Eliminar archivo adjunto"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Note Composer Toolbar */}
        <div className="note-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={e => handleFileUpload(e, false)}
            />
            <button
              type="button"
              className="note-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar archivos a la nota (PDF, imágenes, documentos, hojas de cálculo)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88" />
              </svg>
              <span>Adjuntar archivo(s)</span>
            </button>

            {/* Only asked when the context doesn't already answer it — from
                inside an Opportunity, every new note is auto-tagged instead. */}
            {!isOpportunityScoped && relatedOpportunities.length > 0 && (
              <select
                id="notes-and-files-opp-select"
                value={noteOppId}
                onChange={e => setNoteOppId(e.target.value ? Number(e.target.value) : '')}
                title="Etiquetar esta nota a una oportunidad (opcional)"
                aria-label="Etiquetar a una oportunidad (opcional)"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--charcoal)',
                  border: '1px solid var(--steel)',
                  borderRadius: 'var(--r-md)',
                  padding: '6px 10px',
                  background: 'var(--surface)',
                  maxWidth: '220px'
                }}
              >
                <option value="">Sin etiqueta</option>
                {relatedOpportunities.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddNote}
            disabled={!noteText.trim() && pendingAttachments.length === 0}
          >
            Guardar nota
          </button>
        </div>

        {/* Informative notification about the 24-hour edit window. Dismissible —
            once closed it won't reappear on its own; the "?" next to the section
            title above brings the same message back on demand. */}
        {!isPolicyBannerDismissed && (
          <div className="note-time-limit-banner">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="banner-text">Podrás editar o eliminar la nota únicamente durante las primeras 24 horas post creación.</span>
            <button
              type="button"
              className="note-time-limit-dismiss"
              onClick={dismissPolicyBanner}
              title="Cerrar este aviso"
              aria-label="Cerrar aviso de política de edición"
            >
              &times;
            </button>
          </div>
        )}

        {/* Light break between composing and viewing — a small label and a
            hairline, not a heavy new sub-section. */}
        <div className="notes-history-divider">
          <span>Historial</span>
        </div>

        {/* Contact-mode filter: a searchable dropdown instead of a pill row
            so it stays usable no matter how many opportunities the contact
            has. */}
        {!isOpportunityScoped && relatedOpportunities.length > 0 && (
          <div id="notes-filter-select" style={{ marginTop: '10px', maxWidth: '260px' }}>
            <SearchableSelect
              options={[
                { value: 'general', label: 'General (sin etiqueta)' },
                ...relatedOpportunities.map(o => ({ value: String(o.id), label: o.name }))
              ]}
              value={filterOppId}
              onChange={setFilterOppId}
              allLabel="Todas las notas"
              ariaLabel="Filtrar notas por oportunidad"
            />
          </div>
        )}

        {/* Notes List */}
        <div id="notes-and-files-list" style={{ marginTop: '14px' }}>
          {visibleNotes.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: 'var(--ink-500)', padding: '10px 2px' }}>
              No hay notas para este filtro todavía.
            </p>
          ) : (
            visibleNotes.map(n => {
              const isManager = n.author === currentUserName;
              const isEditing = editingNoteId === n.id;
              const canEdit = isNoteEditable(n);
              const noteOpp = n.opportunityId != null ? relatedOpportunities.find(o => o.id === n.opportunityId) : undefined;

              return (
                <div className="note" key={n.id} id={`note-${n.id}`}>
                  <UserAvatar name={n.author} initials={n.initials} avatarBg={n.avatarBg} avatarUrl={n.avatarUrl} size="md" />

                  <div className="note-body">
                    <div className="note-header-line">
                      <div className="note-author-info">
                        <b>{n.author}</b>
                        <span className="when">{n.time}</span>
                        {noteOpp && (
                          <button
                            type="button"
                            className={`note-opportunity-tag opp-color-${getOpportunityColorIndex(relatedOpportunities, noteOpp.id)}`}
                            title={`Ir a la oportunidad "${noteOpp.name}"`}
                            onClick={() => onNavigateToOpportunity(noteOpp.id)}
                          >
                            {noteOpp.name}
                          </button>
                        )}
                        {n.isEdited && (
                          <span className="note-edited-badge" title="Nota editada">
                            editado
                          </span>
                        )}
                      </div>

                      {/* Contextual Action Menu: Only available within the 24-hour edit window */}
                      {isManager && !isEditing && canEdit && (
                        <div className="note-menu-wrap" ref={openMenuNoteId === n.id ? noteMenuRef : null}>
                          <button
                            type="button"
                            className={`note-menu-btn ${openMenuNoteId === n.id ? 'active' : ''}`}
                            onClick={() => setOpenMenuNoteId(prev => (prev === n.id ? null : n.id))}
                            title="Opciones de la nota (disponible por 24 horas)"
                            aria-label="Opciones de la nota"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                              <circle cx="5" cy="12" r="2" />
                            </svg>
                          </button>

                          {openMenuNoteId === n.id && (
                            <div className="note-dropdown-menu" role="menu">
                              <button type="button" className="note-dropdown-item" role="menuitem" onClick={() => handleStartEditNote(n)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Editar nota
                              </button>
                              <button
                                type="button"
                                className="note-dropdown-item danger"
                                role="menuitem"
                                onClick={() => handlePromptDeleteNote(n)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Eliminar nota
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Note Editor Mode */}
                    {isEditing ? (
                      <div className="note-inline-editor">
                        <textarea
                          value={editingNoteText}
                          onChange={e => setEditingNoteText(e.target.value)}
                          rows={3}
                          autoFocus
                          placeholder="Edita el contenido de la nota..."
                        />

                        {editingAttachments.length > 0 && (
                          <div className="note-pending-attachments" style={{ marginTop: '6px' }}>
                            {editingAttachments.map(att => (
                              <span key={att.id} className="note-attachment-chip">
                                <span className={`att-icon ${att.type}`}>{att.type}</span>
                                <span>{att.name}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--ink-500)' }}>({att.size})</span>
                                <button
                                  type="button"
                                  className="att-remove"
                                  onClick={() => handleRemoveEditingAttachment(att.id)}
                                  title="Eliminar archivo"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <input
                          type="file"
                          multiple
                          ref={editFileInputRef}
                          style={{ display: 'none' }}
                          onChange={e => handleFileUpload(e, true)}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <button type="button" className="note-attach-btn" onClick={() => editFileInputRef.current?.click()}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88" />
                            </svg>
                            <span>Adjuntar</span>
                          </button>

                          <div className="note-inline-actions">
                            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancelEditNote}>
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={!editingNoteText.trim() && editingAttachments.length === 0}
                              onClick={() => handleSaveEditNote(n.id)}
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ whiteSpace: 'pre-line' }}>{n.text}</p>
                        {n.attachments && n.attachments.length > 0 && (
                          <div className="note-attachments-list">
                            {n.attachments.map(att => (
                              <button
                                key={att.id}
                                type="button"
                                className="note-attachment-card"
                                onClick={() => onShowToast(`Abriendo archivo adjunto: ${att.name}`)}
                                title={`Ver o descargar ${att.name}`}
                              >
                                <span className={`note-attachment-chip att-icon ${att.type}`} style={{ padding: 0 }}>
                                  <span className={`att-icon ${att.type}`}>{att.type}</span>
                                </span>
                                <span>{att.name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--ink-500)', fontWeight: 400 }}>({att.size})</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {isManager && canEdit && (
                          <div className="note-edit-countdown" title="Tiempo restante para editar o eliminar esta nota">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{formatNoteRemainingTime(n)}</span>
                          </div>
                        )}
                        {isManager && !canEdit && (
                          <div className="note-locked-badge" title="El tiempo límite de 24 horas para editar o eliminar esta nota ha expirado">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Bloqueada (+24h)</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingNote}
        id="delete-note-overlay-shared"
        tone="danger"
        title="¿Eliminar esta nota?"
        body={
          <>
            No se puede deshacer: la nota se borra del historial.
            {deletingNote && (
              <div className="confirm-dialog-preview">
                "{deletingNote.text.length > 120 ? deletingNote.text.slice(0, 120) + '…' : deletingNote.text}"
              </div>
            )}
          </>
        }
        confirmLabel="Eliminar nota"
        onCancel={() => setDeletingNote(null)}
        onConfirm={handleConfirmDeleteNote}
      />
    </>
  );
};
