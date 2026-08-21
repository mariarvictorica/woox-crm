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
}

export type ViewType = 'dashboard' | 'leads' | 'opportunities' | 'users' | 'lead-detail' | 'opp-detail' | 'user-detail' | 'organizations' | 'org-detail' | 'org-user-detail' | 'sa-users';
export type OppSegment = 'open' | 'all' | 'closed';

// Which top-level panel the current session is viewing: the Org Manager's
// CRM, or the platform-wide Super Admin panel. Distinct from UserMember.role,
// which is a person's role inside their own organization.
export type PlatformRole = 'manager' | 'superadmin';

/** Which token set the app renders with — see woox.css's
 *  html[data-design-system='dublinks'] block and TopBanner.tsx's switch. */
export type DesignSystem = 'hp' | 'dublinks';

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


