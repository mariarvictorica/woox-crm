import React, { useState, useRef, useEffect } from 'react';
import { Organization, UserMember } from '../types';
import { UserAvatar } from './UserAvatar';
import { InviteUserDrawer } from './InviteUserDrawer';
import { COUNTRY_CODES, splitPhone } from '../data/initialData';
import { Dialog } from './Dialog';
import { FormField } from './FormField';
import { UsersTable } from './UsersTable';

interface OrganizationDetailViewProps {
  organization: Organization | undefined;
  users: UserMember[];
  onBack: () => void;
  onUpdateOrganization: (updated: Organization) => void;
  onCreateUser: (newUser: UserMember) => void;
  onUpdateUser: (updatedUser: UserMember) => void;
  onShowToast: (msg: string) => void;
  /** True when this view was entered via "Editar" from the Organizaciones
   *  list, so it should land straight in edit mode instead of the read-only
   *  ficha. */
  autoEdit?: boolean;
  /** Called once autoEdit has been consumed, so the caller can clear the
   *  flag and it doesn't reopen edit mode on a later visit. */
  onAutoEditHandled?: () => void;
  /** Which tab to land on when this view mounts — the component remounts
   *  fresh every time the Super Admin returns from a user's detail page, so
   *  a plain initial value (not a "consumed" flag like autoEdit) is enough
   *  to bring them back to Usuarios instead of resetting to the ficha. */
  initialTab?: 'ficha' | 'usuarios' | 'modulos';
  onSelectUser: (userId: number) => void;
  onSuspendUser: (userId: number, newOwnerId?: number) => void;
  onActivateUser: (userId: number) => void;
  onDeleteUser: (userId: number, newOwnerId?: number) => void;
}

export const OrganizationDetailView: React.FC<OrganizationDetailViewProps> = ({
  organization,
  users,
  onBack,
  onUpdateOrganization,
  onCreateUser,
  onUpdateUser,
  onShowToast,
  autoEdit = false,
  onAutoEditHandled,
  initialTab,
  onSelectUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'ficha' | 'usuarios' | 'modulos'>(initialTab || 'ficha');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOwnerId, setEditOwnerId] = useState<number>(0);
  const [editTradeName, setEditTradeName] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+52');
  const [editPhone, setEditPhone] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoEdit && organization) {
      setIsEditing(true);
      onAutoEditHandled?.();
    }
    // Only re-run when the request itself changes — onAutoEditHandled is
    // expected to clear autoEdit, so including it here would re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit, organization]);

  useEffect(() => {
    if (isEditing && organization) {
      setEditName(organization.name);
      setEditOwnerId(organization.ownerId);
      setEditTradeName(organization.tradeName || '');
      setEditTaxId(organization.taxId || '');
      setEditAddress(organization.address || '');
      setEditEmail(organization.email || '');

      const { code, number } = splitPhone(organization.phone || '');
      setEditCountryCode(code);
      setEditPhone(number);

      setEditLogoUrl(organization.logoUrl || '');
      setErrors({});
    }
  }, [isEditing, organization]);

  if (!organization) {
    return (
      <section id="view-org-detail" className="view active">
        <div
          className="card"
          style={{
            maxWidth: '480px',
            margin: '48px auto',
            textAlign: 'center',
            padding: '36px 28px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--crit-soft)',
              color: 'var(--crit)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
            No encontramos esta organización
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginBottom: '20px' }}>
            Puede que haya sido eliminada o que el enlace ya no sea válido.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Volver a Organizaciones
          </button>
        </div>
      </section>
    );
  }

  const owner = users.find(u => u.id === organization.ownerId);
  const tenantUsers = users.filter(u => u.organization === organization.name);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'El archivo debe ser una imagen válida (JPG, PNG, WebP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'La imagen debe pesar menos de 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditLogoUrl(reader.result);
        setErrors(prev => ({ ...prev, logo: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!editName.trim()) newErrors.name = 'El nombre de la organización es obligatorio';
    if (!editOwnerId) newErrors.owner = 'Seleccioná un Owner';

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    onUpdateOrganization({
      ...organization,
      name: editName.trim(),
      ownerId: editOwnerId,
      tradeName: editTradeName.trim() || undefined,
      taxId: editTaxId.trim() || undefined,
      address: editAddress.trim() || undefined,
      email: editEmail.trim() || undefined,
      phone: editPhone.trim() ? `${editCountryCode} ${editPhone.trim()}` : undefined,
      logoUrl: editLogoUrl || undefined
    });

    setIsEditing(false);
  };

  return (
    <section id="view-org-detail" className="view active">
      <div className="back-link" onClick={onBack} id="btn-back-orgs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Organizaciones
      </div>

      <div
        className="detail-head"
        id="org-detail-header"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        {organization.logoUrl ? (
          <img
            src={organization.logoUrl}
            alt={organization.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--r-lg)',
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid var(--border)'
            }}
          />
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--r-lg)',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {organization.name.trim()[0]?.toUpperCase() || 'O'}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-900)', margin: 0 }}>
            {organization.name}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '4px' }}>
            {organization.tradeName || 'Sin razón comercial registrada'} &middot; Alta: {organization.createdAt}
          </p>
        </div>

        <button
          type="button"
          id="btn-edit-org"
          className="btn btn-primary btn-sm"
          onClick={() => setIsEditing(true)}
          style={{ gap: '7px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          Editar
        </button>
      </div>

      <div
        className={`user-tab-switch tabs-3 ${
          activeTab === 'usuarios' ? 'pos-1' : activeTab === 'modulos' ? 'pos-2' : ''
        }`}
      >
        <div className="user-tab-slider" />
        <button
          type="button"
          onClick={() => setActiveTab('ficha')}
          className={`user-tab-btn ${activeTab === 'ficha' ? 'active' : ''}`}
        >
          Ficha de la organización
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('usuarios')}
          className={`user-tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
        >
          <span>Usuarios</span>
          <span
            style={{
              background: activeTab === 'usuarios' ? 'var(--accent)' : 'var(--border)',
              color: activeTab === 'usuarios' ? 'var(--on-primary)' : 'var(--ink-700)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '100px',
              transition: 'background 0.2s var(--ease), color 0.2s var(--ease)'
            }}
          >
            {tenantUsers.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('modulos')}
          className={`user-tab-btn ${activeTab === 'modulos' ? 'active' : ''}`}
        >
          Módulos
        </button>
      </div>

      {activeTab === 'ficha' && (
        <div className="user-tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" id="card-org-owner">
            <div className="card-head">
              <div className="htitle">
                <h3>Owner</h3>
              </div>
            </div>
            {owner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0' }}>
                <UserAvatar
                  name={owner.name}
                  avatarUrl={owner.avatarUrl}
                  initials={owner.initials}
                  avatarBg={owner.avatarBg}
                  size="xl"
                />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-900)' }}>{owner.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-500)' }}>{owner.email}</div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--steel)', fontStyle: 'italic' }}>
                No encontramos al usuario asignado como Owner.
              </p>
            )}
          </div>

          <div className="card" id="card-org-fields">
            <div className="card-head">
              <div className="htitle">
                <h3>Datos de la organización</h3>
              </div>
            </div>

            <div className="field-list">
              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M9 7h6M9 11h6M9 15h6" />
                </svg>
                <div className="ftext">
                  <div className="k">Razón comercial</div>
                  <div className={`v ${organization.tradeName ? '' : 'empty'}`}>
                    {organization.tradeName || 'Sin razón comercial registrada'}
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="ftext">
                  <div className="k">RFC</div>
                  <div className={`v ${organization.taxId ? '' : 'empty'}`}>
                    {organization.taxId || 'Sin RFC registrado'}
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="ftext">
                  <div className="k">Dirección</div>
                  <div className={`v ${organization.address ? '' : 'empty'}`}>
                    {organization.address || 'Sin dirección registrada'}
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <div className="ftext">
                  <div className="k">Correo de la organización</div>
                  <div className={`v ${organization.email ? '' : 'empty'}`}>
                    {organization.email || 'Sin correo registrado'}
                  </div>
                </div>
              </div>

              <div className="field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div className="ftext">
                  <div className="k">Teléfono</div>
                  <div className={`v ${organization.phone ? '' : 'empty'}`}>
                    {organization.phone || 'Sin teléfono registrado'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div id="card-org-users">
          <div className="card-head">
            <div className="htitle">
              <h3>Usuarios de la organización ({tenantUsers.length})</h3>
            </div>
            <button
              type="button"
              id="btn-add-org-user"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddUserOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Agregar usuario
            </button>
          </div>

          <UsersTable
            users={tenantUsers}
            allUsers={users}
            organizations={[organization]}
            showOrgColumn={false}
            onSelectUser={onSelectUser}
            onUpdateUser={onUpdateUser}
            onSuspendUser={onSuspendUser}
            onActivateUser={onActivateUser}
            onDeleteUser={onDeleteUser}
            onShowToast={onShowToast}
            emptyMessage="Todavía no se invitaron más usuarios a esta organización."
          />
        </div>
      )}

      {activeTab === 'modulos' && (
        <div id="card-org-modules">
          <div className="card-head">
            <div className="htitle">
              <h3>Módulos de la organización</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-500)', marginTop: '2px' }}>
                Lo que esta organización puede usar dentro de la plataforma.
              </p>
            </div>
          </div>

          <div className="module-list">
            <div className="module-row">
              <div className="module-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
              </div>
              <div className="module-copy">
                <div className="module-name">Prospectos y oportunidades</div>
                <div className="module-desc">
                  Gestión de contactos, seguimiento de negociaciones y el asistente de IA que da
                  contexto antes de cada llamada.
                </div>
              </div>
              <span className="module-status" style={{ background: 'var(--good-bg)', color: 'var(--good)' }}>
                Activo
              </span>
            </div>

            <div className="module-row is-upcoming">
              <div className="module-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <div className="module-copy">
                <div className="module-name">Cotizaciones y pagos</div>
                <div className="module-desc">
                  Generar cotizaciones y cobrar directamente desde el CRM, con confirmación
                  automática de venta.
                </div>
              </div>
              <span className="module-status" style={{ background: 'var(--canvas)', color: 'var(--ink-500)' }}>
                Próximamente
              </span>
            </div>

            <div className="module-row is-upcoming">
              <div className="module-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="module-copy">
                <div className="module-name">Canales sociales y bandeja unificada</div>
                <div className="module-desc">
                  WhatsApp, Instagram, Facebook y TikTok en una sola bandeja; cada mensaje que
                  entra crea o actualiza un prospecto.
                </div>
              </div>
              <span className="module-status" style={{ background: 'var(--canvas)', color: 'var(--ink-500)' }}>
                Próximamente
              </span>
            </div>

            <div className="module-row is-upcoming">
              <div className="module-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              </div>
              <div className="module-copy">
                <div className="module-name">Inteligencia predictiva</div>
                <div className="module-desc">
                  Puntaje automático de prospectos, análisis de comportamiento de compra y
                  recordatorios de recompra.
                </div>
              </div>
              <span className="module-status" style={{ background: 'var(--canvas)', color: 'var(--ink-500)' }}>
                Próximamente
              </span>
            </div>
          </div>
        </div>
      )}

      <Dialog
        isOpen={isEditing}
        variant="drawer"
        id="org-edit-drawer"
        title="Editar organización"
        subtitle="Datos de la organización y su Owner."
        onClose={() => setIsEditing(false)}
        onSubmit={handleSaveEdit}
        formId="form-org-edit"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button type="submit" id="btn-save-org-edit" className="btn btn-primary">
              Guardar cambios
            </button>
          </>
        }
      >
        <FormField label="Nombre de la organización" htmlFor="edit-org-name" required error={errors.name}>
          <input
            type="text"
            id="edit-org-name"
            data-autofocus
            value={editName}
            onChange={e => {
              setEditName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            onBlur={e =>
              setErrors(prev => ({
                ...prev,
                name: e.target.value.trim() ? '' : 'Escribí el nombre de la organización'
              }))
            }
          />
        </FormField>

        <FormField
          label="Owner"
          htmlFor="edit-org-owner"
          required
          hint="Solo un usuario que ya pertenezca a esta organización."
          error={errors.owner}
        >
          <select
            id="edit-org-owner"
            value={editOwnerId}
            onChange={e => {
              setEditOwnerId(Number(e.target.value));
              if (errors.owner) setErrors(prev => ({ ...prev, owner: '' }));
            }}
          >
            {tenantUsers.length === 0 && (
              <option value={editOwnerId}>{owner?.name || 'Sin usuarios'}</option>
            )}
            {tenantUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Logo" hint="JPG, PNG o WebP, hasta 5MB." error={errors.logo}>
          <div className="avatar-upload-row">
            {editLogoUrl ? (
              <img
                src={editLogoUrl}
                alt={editName || organization.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--r-lg)',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid var(--border)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {(editName || organization.name).trim()[0]?.toUpperCase() || 'O'}
              </div>
            )}
            <div className="avatar-upload-actions">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {editLogoUrl ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {editLogoUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditLogoUrl('')}
                  style={{ color: 'var(--crit)' }}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        </FormField>

        <div className="field-section">
          <div className="field-section-label">Datos fiscales y de contacto</div>

          <div className="field-row">
            <FormField label="Nombre comercial" htmlFor="edit-org-trade-name">
              <input
                type="text"
                id="edit-org-trade-name"
                value={editTradeName}
                onChange={e => setEditTradeName(e.target.value)}
              />
            </FormField>

            <FormField label="RFC" htmlFor="edit-org-tax-id">
              <input
                type="text"
                id="edit-org-tax-id"
                value={editTaxId}
                onChange={e => setEditTaxId(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Dirección" htmlFor="edit-org-address">
            <input
              type="text"
              id="edit-org-address"
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
            />
          </FormField>

          <FormField label="Correo de la organización" htmlFor="edit-org-email">
            <input
              type="email"
              id="edit-org-email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="edit-org-phone">
            <div className="phone-input-combo">
              <select
                id="edit-org-countrycode"
                aria-label="Código de país"
                className="phone-country-select"
                value={editCountryCode}
                onChange={e => setEditCountryCode(e.target.value)}
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
                id="edit-org-phone"
                className="phone-number-input"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
          </FormField>
        </div>
      </Dialog>

      <InviteUserDrawer
        isOpen={isAddUserOpen}
        organizationName={organization.name}
        onClose={() => setIsAddUserOpen(false)}
        onInviteUser={onCreateUser}
        onShowToast={onShowToast}
      />
    </section>
  );
};
