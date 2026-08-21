import React, { useEffect, useState } from 'react';
import { UserMember } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface OwnerHandoffConfirmDialogProps {
  isOpen: boolean;
  /** 'warn' for suspend (reversible), 'danger' for delete (permanent). */
  tone: 'warn' | 'danger';
  /** States the outcome, never "OK": "Suspender usuario", "Eliminar usuario". */
  confirmLabel: string;
  /** One line explaining what happens, phrased for the tone above. */
  consequenceCopy: string;
  targetUser: UserMember;
  /** True when targetUser is the organization's current Owner. */
  isOwner: boolean;
  /** Other users in the same organization, eligible to take over as Owner. */
  candidates: UserMember[];
  onCancel: () => void;
  /** newOwnerId is only populated when isOwner is true. */
  onConfirm: (newOwnerId?: number) => void;
}

/**
 * Confirmation for suspending or deleting a user, shared by the
 * Organizaciones "Usuarios" list and the Super Admin user detail view.
 *
 * When the target is the organization's Owner, this doesn't just block the
 * action after the fact — it folds the replacement pick into the same
 * confirmation step (mirroring the opportunity-reassignment box already
 * used in UserDetailView's own deactivate/delete flow) and keeps Confirm
 * disabled until a replacement is chosen, so there's no path that leaves an
 * organization without an Owner.
 */
export const OwnerHandoffConfirmDialog: React.FC<OwnerHandoffConfirmDialogProps> = ({
  isOpen,
  tone,
  confirmLabel,
  consequenceCopy,
  targetUser,
  isOwner,
  candidates,
  onCancel,
  onConfirm
}) => {
  const [newOwnerId, setNewOwnerId] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) setNewOwnerId('');
  }, [isOpen, targetUser.id]);

  const needsHandoff = isOwner;
  const hasCandidates = candidates.length > 0;
  const canConfirm = !needsHandoff || (hasCandidates && newOwnerId !== '');

  return (
    <ConfirmDialog
      isOpen={isOpen}
      id={`owner-handoff-confirm-${targetUser.id}`}
      tone={tone}
      width="480px"
      title={`¿${confirmLabel.replace(/ usuario$/, '')} a ${targetUser.name}?`}
      confirmLabel={confirmLabel}
      confirmDisabled={!canConfirm}
      onCancel={onCancel}
      onConfirm={() => onConfirm(needsHandoff && newOwnerId !== '' ? newOwnerId : undefined)}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: tone === 'danger' ? 'var(--crit)' : 'var(--ink-700)' }}>
            {consequenceCopy}
          </p>

          {needsHandoff && hasCandidates && (
            <div className={`confirm-reassign-box ${tone === 'danger' ? 'neutral' : ''}`}>
              <div className="confirm-reassign-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                <span>Esta organización necesita un Owner</span>
              </div>

              <label
                htmlFor={`owner-handoff-select-${targetUser.id}`}
                style={{ fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.4 }}
              >
                Elegí quién lo reemplaza antes de continuar.
              </label>

              <select
                id={`owner-handoff-select-${targetUser.id}`}
                value={newOwnerId}
                onChange={e => setNewOwnerId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Seleccioná un usuario</option>
                {candidates.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.position || 'Sin puesto'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {needsHandoff && !hasCandidates && (
            <div className="confirm-reassign-box neutral">
              <div className="confirm-reassign-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>No hay a quién transferir el rol</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-700)', lineHeight: 1.5 }}>
                Esta organización no tiene otro usuario para asumir el rol de Owner. Invitá a alguien
                más antes de continuar.
              </p>
            </div>
          )}
        </div>
      }
    />
  );
};
