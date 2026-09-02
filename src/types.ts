export type LeadSource = 'retail' | 'b2b' | 'online' | 'referral' | 'ig' | 'wa' | 'fb' | 'tt' | 'manual';

export interface NoteAttachment {
  id: string;
  name: string;
  size: string; // e.g. "1.2 MB", "450 KB"
  type: 'pdf' | 'image' | 'doc' | 'sheet' | 'other';
  url?: string;
}

export interface Contact {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  company: string;
  src: LeadSource;
  srcLabel: string;
  referredBy?: string;
  phone: string;
  email: string;
  region: string;
  giro: string;
  hot: boolean;
  last: string;
  createdAt: string;
  type?: 'Empresa' | 'Particular';
  owner?: string;
  score?: number;
  tags?: string;
  daysInactive?: number;
}

export type StageKey = 'nuevo' | 'contactado' | 'calificado' | 'negociacion' | 'ganado' | 'perdido';

export interface Opportunity {
  id: number;
  name: string;
  contactId: number;
  stage: StageKey;
  rep: string;
  value: number | null;
  close: string;
  last: string;
  /** When this opportunity last moved from one pipeline stage to another
   *  (e.g. Nuevo → Contactado) — distinct from `last`, which is the last
   *  activity of any kind. */
  lastStageChange: string;
  lostReason?: string;
  description?: string;
}

export interface NoteItem {
  id: string;
  /** A note always belongs to a Contact — the unified Notes & Documents
   *  system's one required relationship. */
  contactId: number;
  /** Optional: when set, this note is scoped to one specific Opportunity
   *  belonging to that same contact. Absent = a contact-level note. */
  opportunityId?: number;
  author: string;
  initials: string;
  time: string;
  createdAtTimestamp?: number;
  text: string;
  avatarBg?: string;
  avatarUrl?: string;
  isEdited?: boolean;
  updatedAt?: string;
  attachments?: NoteAttachment[];
}

export interface ActivityEvent {
  id: string;
  initial: string;
  type: 'rep' | 'ai' | 'sys';
  author: string;
  action: string;
  highlight?: string;
  when: string;
  avatarUrl?: string;
}

export interface UserMember {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string;
  email: string;
  role: string;
  organization?: string;
  status: 'Activo' | 'Inactivo' | 'Invitado';
  lastAccess: string;
  initials: string;
  avatarBg: string;
  avatarUrl?: string;
  /**
   * Set when the user presses "Más tarde" on the account-setup section. One
   * choice for the whole section, not per row, and a permanent one: once true it
   * never comes back, even with fields still empty.
   *
   * On the user rather than in App state so it follows the person across sign
   * outs. Without a backend it still resets on reload, and cannot cross
   * devices — that needs an API.
   */
  accountSetupDismissed?: boolean;
}

export type ViewType = 'dashboard' | 'leads' | 'opportunities' | 'users' | 'lead-detail' | 'opp-detail' | 'user-detail' | 'organizations' | 'org-detail' | 'org-user-detail' | 'sa-users' | 'org-management';
export type OppSegment = 'open' | 'all' | 'closed';

// Which top-level panel the current session is viewing: the Org Manager's
// CRM, the same CRM with a sales rep's reduced permissions, or the
// platform-wide Super Admin panel. Distinct from UserMember.role, which is a
// person's role inside their own organization.
export type PlatformRole = 'manager' | 'rep' | 'superadmin';

/** An authenticated session. Null means signed out. */
export interface Session {
  userId: number;
  role: PlatformRole;
}

/** Which token set the app renders with. Each value beyond 'hp' has its own
 *  html[data-design-system='...'] block in woox.css redefining the palette;
 *  'hp' is the baseline declared on :root. Selected from TopBanner. */
export type DesignSystem = 'hp' | 'dublinks' | 'seline';

/** Independent of DesignSystem — combinable with either token set. See
 *  woox.css's html[data-sidebar-mode='light'] block. */
export type SidebarMode = 'dark' | 'light';

export interface Organization {
  id: number;
  name: string;
  tradeName?: string;
  ownerId: number; // reference -> UserMember.id
  logoUrl?: string;
  taxId?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export type LeadSortOption =
  | 'recent'
  | 'activity'
  | 'name'
  | 'opps_count'
  | 'opps_value';

export interface LeadFilterState {
  source: string;
  industry: string;
  activity: string;
  opportunity: string;
  priority?: string;
}


