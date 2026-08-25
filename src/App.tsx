import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Contact,
  Opportunity,
  ViewType,
  StageKey,
  OppSegment,
  ActivityEvent,
  UserMember,
  LeadFilterState,
  PlatformRole,
  Session,
  Organization,
  DesignSystem,
  SidebarMode,
  NoteItem
} from './types';
import {
  INITIAL_CONTACTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_DASHBOARD_ACTIVITIES,
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_NOTES,
  STAGE_LABEL,
  PLATFORM_VIEW_OPTIONS,
  PLATFORM_CAPABILITIES,
  SIGN_IN_VARIANTS
} from './data/initialData';
import type { OrgProfileFieldKey } from './data/initialData';
import { TopBanner } from './components/TopBanner';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LeadsView } from './components/LeadsView';
import { LeadDetailView } from './components/LeadDetailView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { OpportunityDetailView } from './components/OpportunityDetailView';
import { UsersView } from './components/UsersView';
import { OrganizationsView } from './components/OrganizationsView';
import { OrganizationDetailView } from './components/OrganizationDetailView';
import { OrgUserDetailView } from './components/OrgUserDetailView';
import { SuperAdminUsersView } from './components/SuperAdminUsersView';
import { NewLeadModal } from './components/NewLeadModal';
import { NewOpportunityModal } from './components/NewOpportunityModal';
import { NewOrganizationModal, NewOrganizationInput } from './components/NewOrganizationModal';
import { InviteUserDrawer } from './components/InviteUserDrawer';
import { EditUserDrawer } from './components/EditUserDrawer';
import { SignInView } from './components/SignInView';
import { OrgManagementView } from './components/OrgManagementView';
import { UserDetailView } from './components/UserDetailView';
import { Toast } from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('leads');
  const [selectedLeadId, setSelectedLeadId] = useState<number>(0);
  const [selectedOppId, setSelectedOppId] = useState<number>(0);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(0);
  // Set when "Editar" is chosen from the Organizaciones list, so
  // OrganizationDetailView opens straight into edit mode for that org.
  const [pendingOrgEditId, setPendingOrgEditId] = useState<number | null>(null);
  const [selectedOrgUserId, setSelectedOrgUserId] = useState<number>(0);
  // Which organization field "Mi organización" should land on, set when the
  // Owner picks one from the Dashboard notice. Consumed once, like
  // pendingOrgEditId.
  const [pendingOrgField, setPendingOrgField] = useState<OrgProfileFieldKey | null>(null);
  // Which tab OrganizationDetailView should land on next time it mounts —
  // set to 'usuarios' when returning from a user's detail page, so the
  // Super Admin isn't dropped back on the ficha tab.
  const [orgDetailInitialTab, setOrgDetailInitialTab] = useState<'ficha' | 'usuarios' | 'modulos'>('ficha');

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  // Single Notes & Documents store for the whole app — every note belongs to
  // a contact and optionally to one of that contact's opportunities. Both
  // LeadDetailView and OpportunityDetailView read from and write to this
  // same array (filtered differently), instead of each keeping its own
  // disconnected local copy.
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_DASHBOARD_ACTIVITIES);
  const [users, setUsers] = useState<UserMember[]>(INITIAL_USERS);
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);

  // Null until someone signs in. Everything below derives from it, so signing
  // in and out is a single write.
  const [session, setSession] = useState<Session | null>(null);
  // Which of the three sign-ins is on screen. Mirrors the location hash,
  // because in production each is its own URL.
  const [signInVariant, setSignInVariant] = useState<PlatformRole>('manager');
  const currentRole: PlatformRole = session?.role ?? 'manager';
  const currentUserId = session?.userId ?? 0;
  const capabilities = PLATFORM_CAPABILITIES[currentRole];
  // Defaults to 'hp' on every load, deliberately not persisted beyond the
  // session (no localStorage) — nobody should land in the experimental
  // theme by accident on a fresh visit.
  const [designSystem, setDesignSystem] = useState<DesignSystem>('hp');
  // Independent of designSystem — the sidebar's light/dark treatment can
  // be previewed under either design system. Defaults to 'dark' (today's
  // look) for the same reason designSystem defaults to 'hp'.
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('dark');

  // The sign-in variant lives in the hash so each role's screen is its own
  // address, the way production will hand out three URLs. Reading it back also
  // means a reload or a shared link lands on the same screen.
  useEffect(() => {
    const readHash = () => {
      const raw = window.location.hash.replace('#', '').trim();
      const match = SIGN_IN_VARIANTS.find(v => v.role === raw);
      if (match) setSignInVariant(match.role);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-design-system', designSystem);
  }, [designSystem]);

  useEffect(() => {
    document.documentElement.setAttribute('data-sidebar-mode', sidebarMode);
  }, [sidebarMode]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isInviteUserDrawerOpen, setIsInviteUserDrawerOpen] = useState(false);
  // Same drawer, opened from the platform-wide Usuarios tab, where the Super
  // Admin must pick the organization before the rest of the form applies.
  const [isPlatformUserDrawerOpen, setIsPlatformUserDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserMember | null>(null);
  const [oppModalContactId, setOppModalContactId] = useState<number | undefined>(undefined);
  const [leadInitialFilters, setLeadInitialFilters] = useState<Partial<LeadFilterState> | null>(null);
  // Deep-link desde el Dashboard hacia Oportunidades, filtrado por etapa o rep.
  const [oppInitialFilters, setOppInitialFilters] = useState<{
    stage?: StageKey;
    rep?: string;
    segment?: OppSegment;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session-derived values. Up here rather than beside the other derived data
  // because the handlers below need them.
  //
  // The signed-in user is looked up in `users` rather than snapshotted, so
  // editing their own profile is reflected without extra plumbing.
  const currentUser = users.find(u => u.id === currentUserId);
  // No fallback on purpose: the Super Admin belongs to no organization, and a
  // "default to the first one" would hand them a tenant as their own — exactly
  // what the platform/organization split must not do.
  const currentOrg = currentUser?.organization
    ? organizations.find(o => o.name === currentUser.organization)
    : undefined;
  const isOrgOwner = Boolean(currentUser && currentOrg && currentOrg.ownerId === currentUser.id);
  // Everyone in the signed-in user's organization. Filtering by name keeps
  // other tenants' users (and their Owners) out of this org's Usuarios list.
  const orgUsers = users.filter(u => currentOrg && u.organization === currentOrg.name);

  // Whoever is acting, for activity entries. Was the literal 'Enrique' back
  // when he was the only Manager; he now administers the platform, so
  // attributing organization activity to him would be wrong.
  const actorFirstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Sistema';

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const handleNavigate = (view: ViewType) => {
    // Normal navigation resets the deep-link filters; only the Dashboard's own
    // handlers set them.
    if (view === 'leads') {
      setLeadInitialFilters(null);
    }
    if (view === 'opportunities') {
      setOppInitialFilters(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteOrgProfile = (field?: OrgProfileFieldKey) => {
    setPendingOrgField(field ?? null);
    setCurrentView('org-management');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * The prototype's "view as" control. It switches the person as well as the
   * panel: each role is a different account, so keeping the previous user
   * would show, say, the Manager's name over the Super Admin panel — which
   * is exactly the platform/organization split this prototype has to make
   * legible. The account per role comes from SIGN_IN_VARIANTS, the same list
   * the sign-in screens use, so there is one answer to "who is this role".
   */
  const handleSwitchRole = (role: PlatformRole) => {
    const account = SIGN_IN_VARIANTS.find(v => v.role === role);
    const user = account && users.find(u => u.email.toLowerCase() === account.demoEmail.toLowerCase());

    setSession(prev => (prev ? { userId: user ? user.id : prev.userId, role } : prev));

    // Leaving one person's context for another: their open selections mean
    // nothing here.
    setSelectedUserDetails(null);
    setPendingOrgField(null);

    // Landing view comes from the option list, so a new panel brings its own
    // and this stays untouched.
    const landing = PLATFORM_VIEW_OPTIONS.find(o => o.value === role)?.landingView;
    if (landing) setCurrentView(landing);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Resolves credentials for one sign-in screen. Returns an error message, or
   * null once the session is open.
   *
   * Each screen accepts only its own account, which is the whole point of
   * having three: signing in with the Manager's credentials on the App Admin
   * screen has to fail, or the separation is decorative.
   */
  const handleSignIn = (email: string, password: string, role: PlatformRole): string | null => {
    const variant = SIGN_IN_VARIANTS.find(v => v.role === role);
    if (!variant) return 'Este acceso no está disponible';

    if (email !== variant.demoEmail.toLowerCase()) {
      const belongsElsewhere = SIGN_IN_VARIANTS.find(v => v.demoEmail.toLowerCase() === email);
      return belongsElsewhere
        ? `Esa cuenta entra por el acceso de ${belongsElsewhere.tag}`
        : 'No encontramos una cuenta con ese correo';
    }
    if (password !== variant.demoPassword) return 'La contraseña no es correcta';

    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) return 'No encontramos una cuenta con ese correo';
    if (user.status === 'Inactivo') return 'Esta cuenta está suspendida';

    setSession({ userId: user.id, role });
    const landing = PLATFORM_VIEW_OPTIONS.find(o => o.value === role)?.landingView;
    if (landing) setCurrentView(landing);
    window.scrollTo({ top: 0, behavior: 'auto' });
    return null;
  };

  const handleLogout = () => {
    setSession(null);
    setSignInVariant(currentRole);
    window.location.hash = currentRole;
    setSelectedUserDetails(null);
    setPendingOrgField(null);
    setIsEditProfileOpen(false);
  };

  const handleCreateOrganization = (input: NewOrganizationInput) => {
    // The Owner is a real user, not a plain string on the organization. This
    // creates a UserMember for them here, in App.tsx, deliberately NOT through
    // handleSaveInvitedUser — that helper also logs an activity entry to
    // WooX's own team feed, which a cross-tenant Super Admin action must
    // never touch.
    const ownerId = Date.now();
    const fullOwnerName = `${input.ownerFirstName.trim()} ${input.ownerLastName.trim()}`.trim();
    const ownerInitials =
      `${input.ownerFirstName.trim()[0] || ''}${input.ownerLastName.trim()[0] || ''}`.toUpperCase() || 'U';

    const newOwner: UserMember = {
      id: ownerId,
      name: fullOwnerName,
      firstName: input.ownerFirstName.trim(),
      lastName: input.ownerLastName.trim(),
      email: input.ownerEmail.trim().toLowerCase(),
      role: 'Manager',
      organization: input.name.trim(),
      status: 'Invitado',
      lastAccess: 'Pendiente de activación',
      initials: ownerInitials,
      avatarBg: 'var(--graphite)'
    };

    const newId = organizations.length > 0 ? Math.max(...organizations.map(o => o.id)) + 1 : 1;
    const newOrg: Organization = {
      id: newId,
      name: input.name.trim(),
      tradeName: input.tradeName,
      ownerId,
      taxId: input.taxId,
      address: input.address,
      email: input.email,
      phone: input.phone,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newOwner, ...prev]);
    setOrganizations(prev => [newOrg, ...prev]);
    showToast(`Organización "${newOrg.name}" creada con éxito`);
  };

  const handleUpdateOrganization = (updated: Organization) => {
    const previous = organizations.find(o => o.id === updated.id);
    setOrganizations(prev => prev.map(o => (o.id === updated.id ? updated : o)));

    // UserMember.organization holds the organization's NAME, not its id, and
    // five different places filter on that string. Without re-linking here a
    // rename silently orphans every member of the tenant: they vanish from
    // Usuarios, from the organization's own tab, and from the Super Admin's
    // per-organization filter.
    if (previous && previous.name !== updated.name) {
      setUsers(prev =>
        prev.map(u => (u.organization === previous.name ? { ...u, organization: updated.name } : u))
      );
    }

    showToast(`Organización "${updated.name}" actualizada con éxito`);
  };

  // Super Admin adding/editing a tenant's user. Deliberately separate from
  // handleSaveInvitedUser/handleUpdateUser (the Manager's own handlers) —
  // those either log to WooX's own `activities` feed or update
  // Manager-page-only state, neither of which applies to a cross-tenant
  // Super Admin action. The invite/edit toast is already shown by
  // InviteUserDrawer/EditUserDrawer themselves, so these just mutate state.
  const handleSuperAdminCreateUser = (newUser: UserMember) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handleSuperAdminUpdateUser = (updatedUser: UserMember) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleNavigateToLeads = (filters: Partial<LeadFilterState>) => {
    setLeadInitialFilters(filters);
    setCurrentView('leads');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToOpportunities = (filters: {
    stage?: string;
    rep?: string;
    segment?: string;
  }) => {
    setOppInitialFilters({
      stage: filters.stage as StageKey | undefined,
      rep: filters.rep,
      segment: filters.segment as OppSegment | undefined
    });
    setCurrentView('opportunities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLeadsWithoutOpp = () => {
    setLeadInitialFilters({ opportunity: 'without_opp' });
    setCurrentView('leads');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Mostrando prospectos sin oportunidad activa');
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeadId(leadId);
    setCurrentView('lead-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOpportunity = (oppId: number) => {
    setSelectedOppId(oppId);
    setCurrentView('opp-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrganization = (orgId: number) => {
    setSelectedOrgId(orgId);
    setOrgDetailInitialTab('ficha');
    setCurrentView('org-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditOrganization = (orgId: number) => {
    setSelectedOrgId(orgId);
    setPendingOrgEditId(orgId);
    setOrgDetailInitialTab('ficha');
    setCurrentView('org-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrgUser = (userId: number) => {
    setSelectedOrgUserId(userId);
    setCurrentView('org-user-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Same destination as handleSelectOrgUser, but entered from the global
  // Usuarios tab, which has no organization already selected — resolve it
  // from the target user first so OrgUserDetailView's org context (and its
  // "back" link) work identically regardless of entry point.
  const handleSelectGlobalUser = (userId: number) => {
    const target = users.find(u => u.id === userId);
    const org = target ? organizations.find(o => o.name === target.organization) : undefined;
    if (org) setSelectedOrgId(org.id);
    handleSelectOrgUser(userId);
  };

  const handleBackToOrgUsers = () => {
    setOrgDetailInitialTab('usuarios');
    setCurrentView('org-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Super Admin suspending/deleting a tenant's user. Deliberately separate
  // from handleDeactivateUser/handleDeleteUser (the Manager's own
  // handlers) — those reassign the user's open OPPORTUNITIES to another
  // rep, which is a Manager-only concern. Here, the only thing that can be
  // left dangling is the organization's Owner, so newOwnerId (when given)
  // reassigns Organization.ownerId instead.
  const handleSuperAdminSuspendUser = (userId: number, newOwnerId?: number) => {
    if (newOwnerId) {
      setOrganizations(prev =>
        prev.map(o => (o.ownerId === userId ? { ...o, ownerId: newOwnerId } : o))
      );
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'Inactivo' } : u)));
  };

  const handleSuperAdminDeleteUser = (userId: number, newOwnerId?: number) => {
    if (newOwnerId) {
      setOrganizations(prev =>
        prev.map(o => (o.ownerId === userId ? { ...o, ownerId: newOwnerId } : o))
      );
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Unified Notes & Documents handlers. Each caller (LeadDetailView,
  // OpportunityDetailView) builds the fully-formed NoteItem itself — id,
  // author, timestamp, and which contactId/opportunityId it belongs to —
  // since that construction differs per view; these just own the single
  // shared array.
  const handleAddNote = (note: NoteItem) => {
    setNotes(prev => [note, ...prev]);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === noteId ? { ...n, ...updates } : n)));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleToggleHot = (contactId: number) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, hot: !c.hot } : c))
    );
  };

  const handleBulkToggleHot = (leadIds: number[], setHot?: boolean) => {
    setContacts(prev =>
      prev.map(c => {
        if (!leadIds.includes(c.id)) return c;
        const newHot = setHot !== undefined ? setHot : !c.hot;
        return { ...c, hot: newHot };
      })
    );
  };

  const handleQuickAssign = (contactId: number, newOwner: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, owner: newOwner } : c))
    );
    showToast(`Contacto asignado a ${newOwner}`);
  };

  const handleBulkAssign = (leadIds: number[], newOwner: string) => {
    setContacts(prev =>
      prev.map(c => (leadIds.includes(c.id) ? { ...c, owner: newOwner } : c))
    );
  };

  const handleBulkDelete = (leadIds: number[]) => {
    setContacts(prev => prev.filter(c => !leadIds.includes(c.id)));
  };

  const handleUpdateStage = (
    oppId: number,
    newStage: StageKey,
    extraFields?: { value?: number | null; close?: string; lostReason?: string }
  ) => {
    setOpportunities(prev =>
      prev.map(o =>
        o.id === oppId
          ? { ...o, stage: newStage, last: 'justo ahora', lastStageChange: 'justo ahora', ...(extraFields || {}) }
          : o
      )
    );

    const targetOpp = opportunities.find(o => o.id === oppId);
    if (targetOpp) {
      const newAct: ActivityEvent = {
        id: 'act-' + Date.now(),
        initial: 'EM',
        type: 'rep',
        author: actorFirstName,
        action: 'movió',
        highlight: `${targetOpp.name} a ${STAGE_LABEL[newStage]}`,
        when: 'justo ahora'
      };
      setActivities(prev => [newAct, ...prev.slice(0, 7)]);
    }
  };

  const handleCreateLead = (leadData: Partial<Contact>): Contact => {
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 0;

    const newContact: Contact = {
      id: newId,
      name: leadData.name || 'Nuevo Contacto',
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      company: leadData.company || '',
      src: leadData.src || 'retail',
      srcLabel: leadData.srcLabel || 'RET',
      referredBy: leadData.referredBy,
      phone: leadData.phone || '',
      email: leadData.email || '',
      region: leadData.region || 'México',
      giro: leadData.giro || '',
      hot: false,
      last: 'justo ahora',
      daysInactive: 0,
      createdAt: new Date().toISOString().split('T')[0],
      type: leadData.type || (leadData.company ? 'Empresa' : 'Particular')
    };

    setContacts(prev => [newContact, ...prev]);

    const newAct: ActivityEvent = {
      id: 'act-' + Date.now(),
      initial: 'S',
      type: 'sys',
      author: 'Sistema',
      action: `creó el contacto ${newContact.name}`,
      when: 'justo ahora'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 7)]);
    showToast('Contacto guardado con éxito');
    return newContact;
  };

  const handleUpdateLead = (leadId: number, updatedFields: Partial<Contact>) => {
    setContacts(prev =>
      prev.map(c => (c.id === leadId ? { ...c, ...updatedFields } : c))
    );

    const targetContact = contacts.find(c => c.id === leadId);
    const updatedName = updatedFields.name || targetContact?.name || 'Contacto';
    const newAct: ActivityEvent = {
      id: 'act-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: actorFirstName,
      action: 'actualizó los datos del contacto',
      highlight: updatedName,
      when: 'justo ahora'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 7)]);
    showToast('Contacto actualizado con éxito');
  };

  const handleCreateOpportunity = (oppData: Partial<Opportunity>) => {
    const newId = opportunities.length > 0 ? Math.max(...opportunities.map(o => o.id)) + 1 : 0;
    const newOpp: Opportunity = {
      id: newId,
      name: oppData.name || 'Nueva oportunidad',
      contactId: oppData.contactId ?? (contacts[0]?.id || 0),
      stage: oppData.stage || 'nuevo',
      rep: oppData.rep || 'Diego',
      value: oppData.value ?? null,
      close: oppData.close || '—',
      last: 'justo ahora',
      lastStageChange: 'justo ahora'
    };

    setOpportunities(prev => [newOpp, ...prev]);

    const associatedContact = contacts.find(c => c.id === newOpp.contactId);
    const newAct: ActivityEvent = {
      id: 'act-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: actorFirstName,
      action: `creó la oportunidad "${newOpp.name}" ligada a`,
      highlight: associatedContact ? associatedContact.name : 'Contacto',
      when: 'justo ahora'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 7)]);
    showToast('Oportunidad creada y ligada al contacto');
  };

  const handleUpdateOpportunity = (oppId: number, updatedFields: Partial<Opportunity>) => {
    setOpportunities(prev =>
      prev.map(o => (o.id === oppId ? { ...o, ...updatedFields, last: 'justo ahora' } : o))
    );

    const targetOpp = opportunities.find(o => o.id === oppId);
    const updatedName = updatedFields.name || targetOpp?.name || 'Oportunidad';
    const newAct: ActivityEvent = {
      id: 'act-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: actorFirstName,
      action: 'actualizó los datos de la oportunidad',
      highlight: updatedName,
      when: 'justo ahora'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 7)]);
    showToast('Oportunidad actualizada con éxito');
  };

  const handleOpenNewOppModal = (contactId?: number) => {
    setOppModalContactId(contactId);
    setIsOppModalOpen(true);
  };

  const handleOpenInviteUser = () => {
    setIsInviteUserDrawerOpen(true);
  };

  const handleSaveInvitedUser = (newUser: UserMember) => {
    setUsers(prev => [newUser, ...prev]);

    const newAct: ActivityEvent = {
      id: 'act-' + Date.now(),
      initial: 'EM',
      type: 'rep',
      author: actorFirstName,
      action: `envió una invitación a`,
      highlight: newUser.email,
      when: 'justo ahora'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 7)]);
  };

  const handleSelectUser = (user: UserMember) => {
    setSelectedUserDetails(user);
    setCurrentView('user-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Editing your own profile. Two rules live here rather than in the form,
   * because a form can be bypassed and a permission rule shouldn't have a
   * single copy sitting in the UI:
   *
   *  - the write only ever targets the session's own user, so a payload
   *    carrying someone else's id cannot reach another record;
   *  - role and organization are taken from the stored record, never from the
   *    payload, so they cannot be changed from here at all. Both remain the
   *    Super Admin's to change, through their own existing flows.
   */
  const handleUpdateOwnProfile = (updated: UserMember) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === currentUserId ? { ...updated, id: u.id, role: u.role, organization: u.organization } : u
      )
    );
  };

  const handleUpdateUser = (updatedUser: UserMember) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setSelectedUserDetails(updatedUser);
  };

  const handleTransferUserResponsibilities = (oldUser: UserMember, targetUserId?: number) => {
    if (!targetUserId) return;
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;

    const oldFirst = oldUser.firstName || oldUser.name.split(' ')[0] || oldUser.name;
    const targetFirst = targetUser.firstName || targetUser.name.split(' ')[0] || targetUser.name;

    setOpportunities(prev =>
      prev.map(opp => {
        const repClean = (opp.rep || '').trim().toLowerCase();
        const isRep =
          repClean === oldUser.name.toLowerCase() ||
          repClean === oldFirst.toLowerCase() ||
          (oldUser.email && repClean === oldUser.email.toLowerCase());

        if (isRep) {
          return {
            ...opp,
            rep: targetFirst
          };
        }
        return opp;
      })
    );

    setContacts(prev =>
      prev.map(contact => {
        const ownerClean = (contact.owner || '').trim().toLowerCase();
        const isOwner =
          ownerClean === oldUser.name.toLowerCase() ||
          ownerClean === oldFirst.toLowerCase();

        if (isOwner) {
          return {
            ...contact,
            owner: targetFirst
          };
        }
        return contact;
      })
    );
  };

  // newOwnerId is a separate concern from transferToUserId: the latter
  // reassigns this user's own opportunities/leads (optional — a rep can be
  // left temporarily unassigned), while newOwnerId reassigns any
  // Organization.ownerId that pointed at this user, which is never
  // optional — an organization can't be left without an Owner. UserDetailView
  // blocks confirm until it's supplied whenever this user owns an org.
  const handleDeactivateUser = (userId: number, transferToUserId?: number, newOwnerId?: number) => {
    const userToDeactivate = users.find(u => u.id === userId);
    if (userToDeactivate && transferToUserId) {
      handleTransferUserResponsibilities(userToDeactivate, transferToUserId);
    }
    if (newOwnerId) {
      setOrganizations(prev =>
        prev.map(o => (o.ownerId === userId ? { ...o, ownerId: newOwnerId } : o))
      );
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'Inactivo' } : u)));
    if (selectedUserDetails && selectedUserDetails.id === userId) {
      setSelectedUserDetails(prev => prev ? { ...prev, status: 'Inactivo' } : null);
    }
  };

  const handleActivateUser = (userId: number) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'Activo' } : u)));
    if (selectedUserDetails && selectedUserDetails.id === userId) {
      setSelectedUserDetails(prev => prev ? { ...prev, status: 'Activo' } : null);
    }
  };

  const handleDeleteUser = (userId: number, transferToUserId?: number, newOwnerId?: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && transferToUserId) {
      handleTransferUserResponsibilities(userToDelete, transferToUserId);
    }
    if (newOwnerId) {
      setOrganizations(prev =>
        prev.map(o => (o.ownerId === userId ? { ...o, ownerId: newOwnerId } : o))
      );
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (selectedUserDetails && selectedUserDetails.id === userId) {
      setSelectedUserDetails(null);
      setCurrentView('users');
    }
  };

  const currentContact = contacts.find(c => c.id === selectedLeadId) || contacts[0];
  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  const oppContact = currentOpp ? contacts.find(c => c.id === currentOpp.contactId) : undefined;
  const selectedOrg = organizations.find(o => o.id === selectedOrgId);


  return (
    <div className="app-container" id="woox-app">
      <TopBanner
        designSystem={designSystem}
        onSelectDesignSystem={setDesignSystem}
        role={currentRole}
        onSwitchRole={handleSwitchRole}
        showViewSwitcher={Boolean(session)}
      />

      {!session && (
        <SignInView
          variantRole={signInVariant}
          onVariantChange={role => {
            setSignInVariant(role);
            window.location.hash = role;
          }}
          onSignIn={handleSignIn}
        />
      )}

      {session && (
      <div className="app">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          role={currentRole}
          canManageTeam={capabilities.manageTeam}
          canManageOrganization={capabilities.manageOrganization && isOrgOwner}
          currentUser={currentUser}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onLogout={handleLogout}
          sidebarMode={sidebarMode}
          onToggleSidebarMode={() => setSidebarMode(prev => (prev === 'dark' ? 'light' : 'dark'))}
        />

        <main id="main-content-panel">
          {capabilities.platformAdmin && currentView === 'organizations' && (
            <OrganizationsView
              organizations={organizations}
              users={users}
              onOpenNewOrgModal={() => setIsOrgModalOpen(true)}
              onSelectOrganization={handleSelectOrganization}
              onEditOrganization={handleEditOrganization}
            />
          )}

          {capabilities.platformAdmin && currentView === 'org-detail' && (
            <OrganizationDetailView
              organization={selectedOrg}
              users={users}
              onBack={() => handleNavigate('organizations')}
              onUpdateOrganization={handleUpdateOrganization}
              onCreateUser={handleSuperAdminCreateUser}
              onUpdateUser={handleSuperAdminUpdateUser}
              onShowToast={showToast}
              autoEdit={pendingOrgEditId === selectedOrgId}
              onAutoEditHandled={() => setPendingOrgEditId(null)}
              initialTab={orgDetailInitialTab}
              onSelectUser={handleSelectOrgUser}
              onSuspendUser={handleSuperAdminSuspendUser}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleSuperAdminDeleteUser}
            />
          )}

          {capabilities.platformAdmin && currentView === 'org-user-detail' && (
            <OrgUserDetailView
              organization={selectedOrg}
              user={users.find(u => u.id === selectedOrgUserId)}
              tenantUsers={selectedOrg ? users.filter(u => u.organization === selectedOrg.name) : []}
              onBack={handleBackToOrgUsers}
              onUpdateUser={handleSuperAdminUpdateUser}
              onSuspendUser={handleSuperAdminSuspendUser}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleSuperAdminDeleteUser}
              onShowToast={showToast}
            />
          )}

          {capabilities.platformAdmin && currentView === 'sa-users' && (
            <SuperAdminUsersView
              users={users}
              organizations={organizations}
              onSelectUser={handleSelectGlobalUser}
              onAddUser={() => setIsPlatformUserDrawerOpen(true)}
              onUpdateUser={handleSuperAdminUpdateUser}
              onSuspendUser={handleSuperAdminSuspendUser}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleSuperAdminDeleteUser}
              onShowToast={showToast}
            />
          )}

          {(currentRole === 'manager' || currentRole === 'rep') && (
            <>
          {currentView === 'dashboard' && (
            <DashboardView
              currentUserName={currentUser?.name || ''}
              contacts={contacts}
              opportunities={opportunities}
              activities={activities}
              onNavigate={handleNavigate}
              onNavigateToLeads={handleNavigateToLeads}
              onNavigateToOpportunities={handleNavigateToOpportunities}
              onSelectOpportunity={handleSelectOpportunity}
              orgUsers={orgUsers}
              canSeeTeam={capabilities.manageTeam}
              organization={currentOrg}
              isOrgOwner={capabilities.manageOrganization && isOrgOwner}
              onCompleteOrgProfile={handleCompleteOrgProfile}
            />
          )}

          {currentView === 'leads' && (
            <LeadsView
              contacts={contacts}
              opportunities={opportunities}
              initialFilters={leadInitialFilters}
              onSelectLead={handleSelectLead}
              onSelectOpportunity={handleSelectOpportunity}
              onOpenLeadModal={() => setIsLeadModalOpen(true)}
              onOpenNewOppModal={handleOpenNewOppModal}
              onToggleHot={handleToggleHot}
              onShowToast={showToast}
            />
          )}

          {currentView === 'lead-detail' && currentContact && (
            <LeadDetailView
              currentUserName={currentUser?.name || ''}
              contact={currentContact}
              opportunities={opportunities}
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onBack={() => handleNavigate('leads')}
              onSelectOpportunity={handleSelectOpportunity}
              onOpenNewOppModal={handleOpenNewOppModal}
              onCreateOpportunity={handleCreateOpportunity}
              onUpdateLead={handleUpdateLead}
              onToggleHot={handleToggleHot}
              onShowToast={showToast}
            />
          )}

          {currentView === 'opportunities' && (
            <OpportunitiesView
              initialFilters={oppInitialFilters}
              opportunities={opportunities}
              contacts={contacts}
              onSelectOpportunity={handleSelectOpportunity}
              onSelectLead={handleSelectLead}
              onOpenNewOppModal={() => handleOpenNewOppModal()}
            />
          )}

          {currentView === 'opp-detail' && currentOpp && (
            <OpportunityDetailView
              currentUserName={currentUser?.name || ''}
              opportunity={currentOpp}
              opportunities={opportunities}
              contact={oppContact}
              contacts={contacts}
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onBack={() => handleNavigate('opportunities')}
              onSelectLead={handleSelectLead}
              onSelectOpportunity={handleSelectOpportunity}
              onUpdateStage={handleUpdateStage}
              onUpdateOpportunity={handleUpdateOpportunity}
              onShowToast={showToast}
            />
          )}

          {currentView === 'users' && capabilities.manageTeam && (
            <UsersView
              users={orgUsers}
              onSelectUser={handleSelectUser}
              onInviteUser={handleOpenInviteUser}
              onShowToast={showToast}
            />
          )}

          {currentView === 'org-management' && capabilities.manageOrganization && isOrgOwner && currentOrg && (
            <OrgManagementView
              organization={currentOrg}
              owner={currentUser}
              allOrganizations={organizations}
              onUpdateOrganization={handleUpdateOrganization}
              focusField={pendingOrgField}
              onFocusFieldHandled={() => setPendingOrgField(null)}
            />
          )}

          {currentView === 'user-detail' && capabilities.manageTeam && selectedUserDetails && (
            <UserDetailView
              user={selectedUserDetails}
              allUsers={orgUsers}
              organizations={organizations}
              opportunities={opportunities}
              contacts={contacts}
              onBack={() => handleNavigate('users')}
              onUpdateUser={handleUpdateUser}
              onDeactivateUser={handleDeactivateUser}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleDeleteUser}
              onSelectOpportunity={handleSelectOpportunity}
              onSelectLead={handleSelectLead}
              onShowToast={showToast}
            />
          )}
            </>
          )}
        </main>
      </div>
      )}

      <NewLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onCreateLead={handleCreateLead}
        onViewLead={handleSelectLead}
        onCreateOpportunity={handleOpenNewOppModal}
        onShowToast={showToast}
      />

      <NewOpportunityModal
        isOpen={isOppModalOpen}
        contacts={contacts}
        preselectedContactId={oppModalContactId}
        onClose={() => setIsOppModalOpen(false)}
        onCreateOpportunity={handleCreateOpportunity}
      />

      <InviteUserDrawer
        isOpen={isInviteUserDrawerOpen}
        organizationName={currentOrg?.name}
        existingUsers={users}
        onClose={() => setIsInviteUserDrawerOpen(false)}
        onInviteUser={handleSaveInvitedUser}
        onShowToast={showToast}
      />

      <InviteUserDrawer
        isOpen={isPlatformUserDrawerOpen}
        requireOrganizationSelect
        organizations={organizations}
        existingUsers={users}
        onClose={() => setIsPlatformUserDrawerOpen(false)}
        onInviteUser={handleSuperAdminCreateUser}
        onShowToast={showToast}
      />

      {currentUser && (
        <EditUserDrawer
          isOpen={isEditProfileOpen}
          user={currentUser}
          selfEdit
          organizationName={currentOrg?.name}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleUpdateOwnProfile}
          onShowToast={showToast}
        />
      )}

      <NewOrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onCreateOrganization={handleCreateOrganization}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
