import { Contact, Opportunity, UserMember, ActivityEvent, StageKey, Organization, NoteItem, PlatformRole, ViewType, DesignSystem } from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 0,
    name: 'Ana Torres',
    company: 'Hotel Riviera Maya',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 998 123 4521',
    email: 'ana.torres@hotelriviera.mx',
    region: 'Quintana Roo',
    giro: 'Hotelería',
    hot: true,
    last: '12m ago',
    daysInactive: 0,
    createdAt: '2026-08-10',
    type: 'Empresa'
  },
  {
    id: 1,
    name: 'Roberto Díaz',
    company: 'Constructora del Norte',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 871 220 9981',
    email: 'roberto@construnorte.mx',
    region: 'Coahuila',
    giro: 'Construcción',
    hot: true,
    last: '25m ago',
    daysInactive: 0,
    createdAt: '2026-08-11',
    type: 'Empresa'
  },
  {
    id: 2,
    name: 'Contratista García',
    company: 'Grupo García Obra Civil',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 871 555 0132',
    email: 'garcia.obras@gmail.com',
    region: 'Coahuila',
    giro: 'Construcción',
    hot: false,
    last: '1h ago',
    daysInactive: 0,
    createdAt: '2026-08-12',
    type: 'Empresa'
  },
  {
    id: 3,
    name: 'María Fernanda López',
    company: '',
    src: 'retail',
    srcLabel: 'Retail',
    phone: '+52 871 300 4410',
    email: 'marifer.lopez@outlook.com',
    region: 'Coahuila',
    giro: 'Retail',
    hot: false,
    last: '3h ago',
    daysInactive: 0,
    createdAt: '2026-08-01',
    type: 'Particular'
  },
  {
    id: 4,
    name: 'Arq. Sofía Landeros',
    company: 'Landeros Arquitectura & Diseño',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 33 1122 3344',
    email: 'sofia@landerosarq.mx',
    region: 'Jalisco',
    giro: 'Arquitectura',
    hot: true,
    last: '4h ago',
    daysInactive: 0,
    createdAt: '2026-08-08',
    type: 'Empresa'
  },
  {
    id: 5,
    name: 'Terrazas del Mar S.A.',
    company: 'Operadora Turística del Caribe',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 998 700 1290',
    email: 'compras@terrazasdelmar.mx',
    region: 'Quintana Roo',
    giro: 'Hotelería',
    hot: false,
    last: 'Yesterday',
    daysInactive: 1,
    createdAt: '2026-08-05',
    type: 'Empresa'
  },
  {
    id: 6,
    name: 'Julián Ríos',
    company: 'Pinturas Express',
    src: 'retail',
    srcLabel: 'Retail',
    phone: '+52 55 4433 2211',
    email: 'jrios@pinturasexpress.com',
    region: 'CDMX',
    giro: 'Retail',
    hot: false,
    last: 'Yesterday',
    daysInactive: 1,
    createdAt: '2026-08-12',
    type: 'Empresa'
  },
  {
    id: 7,
    name: 'Constructora Vallarta',
    company: 'Desarrollos Vallarta S.A.',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 322 190 8871',
    email: 'proyectos@desarrollosvallarta.mx',
    region: 'Jalisco',
    giro: 'Construcción',
    hot: false,
    last: '9d ago',
    daysInactive: 9,
    createdAt: '2026-07-20',
    type: 'Empresa'
  },
  {
    id: 8,
    name: 'Rosa Elena Martínez',
    company: 'Residencial Las Palmas',
    src: 'online',
    srcLabel: 'Online',
    phone: '+52 871 998 2201',
    email: 'rosaelena.mtz@hotmail.com',
    region: 'Coahuila',
    giro: 'Servicios',
    hot: false,
    last: '11d ago',
    daysInactive: 11,
    createdAt: '2026-07-15',
    type: 'Particular'
  },
  {
    id: 9,
    name: 'Ing. Carlos Mendoza',
    company: 'Mendoza Estructuras & Acabados',
    src: 'b2b',
    srcLabel: 'B2B',
    phone: '+52 81 8345 6789',
    email: 'carlos@mendozaestructuras.com',
    region: 'Nuevo León',
    giro: 'Construcción',
    hot: true,
    last: '2d ago',
    daysInactive: 2,
    createdAt: '2026-08-11',
    type: 'Empresa'
  },
  {
    id: 10,
    name: 'Boutique Hotel Tulum',
    company: 'Grupo EcoTurismo Riviera',
    src: 'online',
    srcLabel: 'Online',
    phone: '+52 984 109 3322',
    email: 'admin@boutiquetulum.mx',
    region: 'Quintana Roo',
    giro: 'Hotelería',
    hot: true,
    last: '5h ago',
    daysInactive: 0,
    createdAt: '2026-08-13',
    type: 'Empresa'
  },
  {
    id: 11,
    name: 'Estudio de Interiorismo Nova',
    company: 'Nova Space Design',
    src: 'online',
    srcLabel: 'Online',
    phone: '+52 55 5678 1234',
    email: 'hola@novaspacedesign.mx',
    region: 'CDMX',
    giro: 'Arquitectura',
    hot: false,
    last: '14d ago',
    daysInactive: 14,
    createdAt: '2026-07-10',
    type: 'Empresa'
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 0,
    name: 'Acabado exterior — 3 terrazas',
    contactId: 0,
    stage: 'negociacion',
    rep: 'Diego',
    value: 42000,
    close: '20 ago 2026',
    last: 'hace 12 min',
    lastStageChange: 'hace 2 días'
  },
  {
    id: 1,
    name: 'Recompra — mantenimiento anual',
    contactId: 0,
    stage: 'ganado',
    rep: 'Diego',
    value: 18500,
    close: '30 jul 2026',
    last: 'hace 5 días',
    lastStageChange: 'hace 1 mes'
  },
  {
    id: 2,
    name: 'Suministro pintura industrial',
    contactId: 1,
    stage: 'contactado',
    rep: 'Diego',
    value: 96000,
    close: '5 sep 2026',
    last: 'hace 25 min',
    lastStageChange: 'hace 6 días'
  },
  {
    id: 3,
    name: 'Cotización inicial',
    contactId: 2,
    stage: 'nuevo',
    rep: 'Maria Torres',
    value: 12000,
    close: '—',
    last: 'hace 1 h',
    lastStageChange: 'hace 3 días'
  },
  {
    id: 4,
    name: 'Compra mostrador',
    contactId: 3,
    stage: 'ganado',
    rep: 'Adamaris',
    value: 2300,
    close: '1 ago 2026',
    last: 'hace 3 h',
    lastStageChange: 'hace 25 días'
  },
  {
    id: 5,
    name: 'Proyecto fachada residencial',
    contactId: 4,
    stage: 'calificado',
    rep: 'Adamaris',
    value: 31000,
    close: '15 sep 2026',
    last: 'hace 4 h',
    lastStageChange: 'hace 6 días'
  },
  {
    id: 6,
    name: 'Impermeabilizante terrazas',
    contactId: 5,
    stage: 'negociacion',
    rep: 'Maria Torres',
    value: 54000,
    close: '25 ago 2026',
    last: 'ayer',
    lastStageChange: 'hace 4 días'
  },
  {
    id: 7,
    name: 'Pedido inicial retail',
    contactId: 6,
    stage: 'nuevo',
    rep: 'Diego',
    value: 8000,
    close: '—',
    last: 'ayer',
    lastStageChange: 'hace 6 días'
  },
  {
    id: 8,
    name: 'Proyecto fachada torre',
    contactId: 7,
    stage: 'perdido',
    rep: 'Diego',
    value: 120000,
    close: '—',
    last: 'hace 2 días',
    lastStageChange: 'hace 3 días',
    lostReason: 'Precio — eligieron otro proveedor'
  },
  {
    id: 9,
    name: 'Consulta producto',
    contactId: 8,
    stage: 'contactado',
    rep: 'Maria Torres',
    value: null,
    close: '—',
    last: 'hace 2 días',
    lastStageChange: 'hace 5 días'
  },
  {
    id: 10,
    name: 'Acabados Torre Altabrisa',
    contactId: 2,
    stage: 'ganado',
    rep: 'Maria Torres',
    value: 58000,
    close: '2026-05-18',
    last: 'hace 3 meses',
    lastStageChange: 'hace 4 meses'
  },
  {
    id: 11,
    name: 'Pintura antibacterial clínica',
    contactId: 4,
    stage: 'ganado',
    rep: 'Diego',
    value: 34500,
    close: '2026-06-12',
    last: 'hace 2 meses',
    lastStageChange: 'hace 3 meses'
  },
  {
    id: 12,
    name: 'Revestimiento alberca club',
    contactId: 5,
    stage: 'ganado',
    rep: 'Adamaris',
    value: 47200,
    close: '2026-06-28',
    last: 'hace 2 meses',
    lastStageChange: 'hace 3 meses'
  },
  {
    id: 13,
    name: 'Sellador y esmalte para bodegas',
    contactId: 1,
    stage: 'ganado',
    rep: 'Diego',
    value: 62000,
    close: '2026-07-15',
    last: 'hace 1 mes',
    lastStageChange: 'hace 2 meses'
  },
  {
    id: 14,
    name: 'Restauración fachada histórica',
    contactId: 7,
    stage: 'ganado',
    rep: 'Maria Torres',
    value: 89000,
    close: '2026-08-14',
    last: 'hace 4 días',
    lastStageChange: 'hace 20 días'
  }
];

export const STAGE_CONFIG: { key: StageKey; label: string; color: string }[] = [
  { key: 'nuevo', label: 'Nuevo', color: 'var(--graphite)' },
  { key: 'contactado', label: 'Contactado', color: 'var(--warn)' },
  { key: 'calificado', label: 'Calificado', color: 'var(--accent)' },
  { key: 'negociacion', label: 'Negociación', color: 'var(--orange)' },
  { key: 'ganado', label: 'Ganado', color: 'var(--good)' },
  { key: 'perdido', label: 'Perdido', color: 'var(--crit)' }
];

export const STAGE_LABEL: Record<StageKey, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  negociacion: 'Negociación',
  ganado: 'Ganado',
  perdido: 'Perdido'
};

export const OPEN_STAGES: StageKey[] = ['nuevo', 'contactado', 'calificado', 'negociacion'];

export const EMPLOYEE_PROFILES: Record<string, {
  name: string;
  role: string;
  avatarUrl: string;
  initials: string;
  avatarBg: string;
}> = {
  'Enrique Macias': {
    name: 'Enrique Macias',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'EM',
    avatarBg: 'var(--accent)'
  },
  'Enrique': {
    name: 'Enrique Macias',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'EM',
    avatarBg: 'var(--accent)'
  },
  'Pedro Barcellona': {
    name: 'Pedro Barcellona',
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    initials: 'PB',
    avatarBg: 'var(--primary)'
  },
  'Pedro': {
    name: 'Pedro Barcellona',
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    initials: 'PB',
    avatarBg: 'var(--primary)'
  },
  'Diego': {
    name: 'Diego',
    role: 'Vendedor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    initials: 'D',
    avatarBg: 'var(--info)'
  },
  'Maria Torres': {
    name: 'Maria Torres',
    role: 'Representante de Ventas',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    initials: 'MT',
    avatarBg: 'var(--orange)'
  },
  'Adamaris': {
    name: 'Adamaris',
    role: 'Vendedora',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    initials: 'A',
    avatarBg: 'var(--storm-deep)'
  }
};

export function getEmployeeProfile(name?: string) {
  if (!name || name === 'Unassigned' || name === 'Sin asignar') {
    return null;
  }
  const cleanName = name.trim();
  if (EMPLOYEE_PROFILES[cleanName]) {
    return EMPLOYEE_PROFILES[cleanName];
  }
  // Try partial match
  const key = Object.keys(EMPLOYEE_PROFILES).find(k => cleanName.toLowerCase().startsWith(k.toLowerCase()) || k.toLowerCase().startsWith(cleanName.toLowerCase()));
  if (key) {
    return EMPLOYEE_PROFILES[key];
  }
  // Fallback profile
  const initials = cleanName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  return {
    name: cleanName,
    role: 'Rep',
    avatarUrl: undefined,
    initials,
    avatarBg: 'var(--graphite)'
  };
}

// Single source for the phone country-code selector. Previously duplicated in
// NewLeadModal, EditLeadModal, NewOrganizationModal and OrganizationDetailView,
// which is how they drifted out of sync.
export const COUNTRY_CODES = [
  { code: '+52', label: '+52' },
  { code: '+1', label: '+1' },
  { code: '+34', label: '+34' },
  { code: '+54', label: '+54' },
  { code: '+57', label: '+57' },
  { code: '+56', label: '+56' },
  { code: '+51', label: '+51' },
  { code: '+502', label: '+502' },
  { code: '+503', label: '+503' },
  { code: '+504', label: '+504' },
  { code: '+506', label: '+506' },
  { code: '+507', label: '+507' },
  { code: '+593', label: '+593' },
  { code: '+598', label: '+598' },
  { code: '+591', label: '+591' }
];

/** Splits a stored "+52 871 123 4567" into its code and local-number parts. */
export const splitPhone = (raw: string): { code: string; number: string } => {
  const value = (raw || '').trim();
  for (const c of COUNTRY_CODES) {
    if (value.startsWith(c.code)) {
      return { code: c.code, number: value.substring(c.code.length).trim() };
    }
  }
  return { code: '+52', number: value };
};

/**
 * How a stored role reads on screen. The value in the data stays short
 * ('Rep') because eleven comparisons and every filter depend on it; only the
 * label changes here. Was a one-line helper duplicated in three components,
 * which is how one of them could have kept saying "Rep" after the others were
 * updated.
 */
export function displayRole(role: string): string {
  if (role === 'Rep') return 'Representante Ventas';
  if (role === 'Super Admin (SA)') return 'Super Admin';
  return role;
}

export const USER_ROLES_LIST = [
  { value: 'Rep', label: 'Representante Ventas', desc: 'Asesor comercial para atención de leads y oportunidades' },
  { value: 'Manager', label: 'Manager', desc: 'Supervisión de equipo, reportes y gestión comercial' }
];

/** Same email shape check everywhere one is asked for. Lived as a local
 *  constant inside InviteUserDrawer until a second and third caller needed
 *  it — the country-code list drifted that way before. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The panels the prototype can be viewed as. The view selector renders this
 * list rather than a pair of hardcoded options, so adding the Rep panel later
 * is one entry here plus its landing view — no change to the control itself.
 */
/* =============================================================================
   Date handling and dashboard aggregates.

   parseOpportunityCloseDate was the project's only date parser and lived
   unexported inside DashboardView, so anything else needing month buckets
   would have had to rewrite it. Opportunity.close carries both ISO
   (2026-07-15) and Spanish (30 jul 2026) in the same field, which is why the
   parser handles both plus a no-date case.
   ============================================================================= */

export interface ParsedCloseDate {
  dateObj: Date | null;
  formattedDate: string;
  monthKey: string;
  monthName: string;
  monthShort: string;
  timestamp: number;
}

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_SHORTS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function parseOpportunityCloseDate(closeStr?: string): ParsedCloseDate {
  if (!closeStr || closeStr === '—' || closeStr === '-') {
    return {
      dateObj: null,
      formattedDate: 'Fecha no especificada',
      monthKey: '9999-99',
      monthName: 'Sin fecha',
      monthShort: 'S/F',
      timestamp: 0
    };
  }

  // 1. Check ISO format YYYY-MM-DD
  const isoMatch = closeStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[month]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[month]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[month]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  // 2. Check Spanish format like "30 jul 2026", "1 ago 2026", "14 ago 2026"
  const spanishMonths: Record<string, number> = {
    ene: 0, enero: 0,
    feb: 1, febrero: 1,
    mar: 2, marzo: 2,
    abr: 3, abril: 3,
    may: 4, mayo: 4,
    jun: 5, junio: 5,
    jul: 6, julio: 6,
    ago: 7, agosto: 7,
    sep: 8, sept: 8, septiembre: 8,
    oct: 9, octubre: 9,
    nov: 10, noviembre: 10,
    dic: 11, diciembre: 11
  };
  const spMatch = closeStr.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})/);
  if (spMatch) {
    const day = parseInt(spMatch[1], 10);
    const monthStr = spMatch[2].toLowerCase();
    const year = parseInt(spMatch[3], 10);
    const monthIndex = spanishMonths[monthStr] !== undefined ? spanishMonths[monthStr] : 7;
    const d = new Date(year, monthIndex, day);
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[monthIndex]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[monthIndex]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[monthIndex]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  // 3. Fallback standard parse
  const parsed = Date.parse(closeStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    return {
      dateObj: d,
      formattedDate: `${day} de ${MONTH_NAMES_ES[month]} ${year}`,
      monthKey,
      monthName: `${MONTH_NAMES_ES[month]} ${year}`,
      monthShort: `${MONTH_SHORTS_ES[month]} '${String(year).slice(2)}`,
      timestamp: d.getTime()
    };
  }

  return {
    dateObj: null,
    formattedDate: closeStr,
    monthKey: '9999-99',
    monthName: 'Sin fecha',
    monthShort: 'S/F',
    timestamp: 0
  };
}

/** Month key ('YYYY-MM') for an ISO date, or null when unparseable. */
export function isoMonthKey(iso?: string): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

/** The month keys of the most recent month present in `keys`, and the one
 *  before it. Derived from the data rather than from today's date: the seed's
 *  latest activity is not necessarily the current month, and a dashboard that
 *  assumed "now" would show an empty current period. */
export function latestTwoMonths(keys: string[]): { current: string | null; previous: string | null } {
  const real = Array.from(new Set(keys.filter(k => k && k !== '9999-99'))).sort();
  return {
    current: real.length ? real[real.length - 1] : null,
    previous: real.length > 1 ? real[real.length - 2] : null
  };
}

export interface Delta {
  pct: number;
  direction: 'up' | 'down' | 'flat';
}

/** Percentage change, or null when there is no prior period to compare
 *  against. Null is meaningful here: the KPI says so instead of showing a
 *  dash that reads like zero. */
export function computeDelta(current: number, previous: number | null | undefined): Delta | null {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current === 0 ? { pct: 0, direction: 'flat' } : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
}

export interface StageBreakdown {
  key: StageKey;
  label: string;
  color: string;
  count: number;
  value: number;
}

/** Count and monetary value per pipeline stage. The value was already being
 *  computed in the dashboard and thrown away. */
export function getStageBreakdown(opportunities: Opportunity[]): StageBreakdown[] {
  return STAGE_CONFIG.map(cfg => {
    const inStage = opportunities.filter(o => o.stage === cfg.key);
    return {
      key: cfg.key,
      label: cfg.label,
      color: cfg.color,
      count: inStage.length,
      value: inStage.reduce((sum, o) => sum + (o.value || 0), 0)
    };
  });
}

export interface RepPerformance {
  name: string;
  openCount: number;
  openValue: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  /** Null when the rep has closed nothing — a rate over zero deals is noise. */
  winRate: number | null;
}

/** Per-representative rollup. Opportunity.rep holds a name string rather than
 *  a user id, so this joins on name; reps with no opportunities at all still
 *  appear, since "no pipeline" is the signal worth surfacing. */
export function getRepPerformance(opportunities: Opportunity[], repNames: string[]): RepPerformance[] {
  return repNames
    .map(name => {
      const mine = opportunities.filter(o => o.rep === name);
      const open = mine.filter(o => OPEN_STAGES.includes(o.stage));
      const won = mine.filter(o => o.stage === 'ganado');
      const lost = mine.filter(o => o.stage === 'perdido');
      const closed = won.length + lost.length;
      return {
        name,
        openCount: open.length,
        openValue: open.reduce((s, o) => s + (o.value || 0), 0),
        wonCount: won.length,
        wonValue: won.reduce((s, o) => s + (o.value || 0), 0),
        lostCount: lost.length,
        winRate: closed > 0 ? Math.round((won.length / closed) * 100) : null
      };
    })
    .sort((a, b) => b.openValue - a.openValue || b.wonValue - a.wonValue);
}

/** Contacts with no opportunity in an open stage. */
export function getContactsWithoutOpenOpp(contacts: Contact[], opportunities: Opportunity[]): Contact[] {
  const withOpen = new Set(
    opportunities.filter(o => OPEN_STAGES.includes(o.stage)).map(o => o.contactId)
  );
  return contacts.filter(c => !withOpen.has(c.id));
}

/** Contacts untouched for at least `days`. Uses daysInactive, the only
 *  numeric time field in the model — `last` is display text ('9d ago'). */
export function getStaleContacts(contacts: Contact[], days: number): Contact[] {
  return contacts.filter(c => (c.daysInactive ?? 0) >= days);
}

/**
 * The design systems available for side-by-side comparison. The prototype is
 * a review tool, so all of them stay selectable — switching is a preview, not
 * a migration. Adding a fourth is one entry here plus its token block in
 * woox.css; the selector renders this list.
 */
export const DESIGN_SYSTEM_OPTIONS: { value: DesignSystem; label: string; description: string }[] = [
  { value: 'hp', label: 'HP', description: 'El diseño actual del prototipo' },
  { value: 'dublinks', label: 'Dublinks', description: 'Geist, tinta negra y acento ámbar' },
  { value: 'seline', label: 'Seline', description: 'Lato sobre papel cálido, acento cian' }
];

export const PLATFORM_VIEW_OPTIONS: { value: PlatformRole; label: string; landingView: ViewType }[] = [
  { value: 'manager', label: 'Manager', landingView: 'dashboard' },
  { value: 'rep', label: 'Representante de Ventas', landingView: 'dashboard' },
  { value: 'superadmin', label: 'Super Admin', landingView: 'organizations' }
];

/**
 * What each panel is allowed to do. One table instead of role checks spread
 * through the components, so a new panel declares its permissions here and
 * every gate follows.
 */
export interface PlatformCapabilities {
  /** The Usuarios tab: see the team, invite, edit and suspend members. */
  manageTeam: boolean;
  /** "Mi organización". Still additionally requires being the Owner. */
  manageOrganization: boolean;
  /** The cross-organization panel: Organizaciones and platform-wide Usuarios. */
  platformAdmin: boolean;
}

export const PLATFORM_CAPABILITIES: Record<PlatformRole, PlatformCapabilities> = {
  manager: { manageTeam: true, manageOrganization: true, platformAdmin: false },
  // A rep works the same CRM — contacts, opportunities, notes — but the team
  // and the organization's own record are not theirs to administer.
  rep: { manageTeam: false, manageOrganization: false, platformAdmin: false },
  superadmin: { manageTeam: false, manageOrganization: false, platformAdmin: true }
};

/**
 * The sign-in screens. In production each of these is its own URL; here the
 * variant comes from the location hash, so the three are genuinely three
 * addresses rather than a toggle.
 *
 * Credentials are shown on the screen on purpose: the point is to demo the
 * flow, including getting it wrong.
 */
export const SIGN_IN_VARIANTS: {
  role: PlatformRole;
  tag: string;
  demoEmail: string;
  demoPassword: string;
}[] = [
  { role: 'superadmin', tag: 'App Admin', demoEmail: 'enrique@woox.mx', demoPassword: 'demo1234' },
  { role: 'manager', tag: 'Manager', demoEmail: 'pedro@garin.mx', demoPassword: 'demo1234' },
  { role: 'rep', tag: 'Representante de Ventas', demoEmail: 'maria@garin.mx', demoPassword: 'demo1234' }
];

export type OrgProfileFieldKey = 'logoUrl' | 'tradeName' | 'taxId' | 'address' | 'email' | 'phone';

export interface OrgProfileField {
  key: OrgProfileFieldKey;
  label: string;
}

/** What the Owner still has to fill in after the Super Admin creates the
 *  organization. `name` is absent on purpose: creating one without a name is
 *  impossible, so it is never pending. */
export const ORG_PROFILE_FIELDS: OrgProfileField[] = [
  { key: 'logoUrl', label: 'Logo' },
  { key: 'tradeName', label: 'Nombre comercial' },
  { key: 'taxId', label: 'RFC' },
  { key: 'address', label: 'Dirección' },
  { key: 'email', label: 'Correo de la organización' },
  { key: 'phone', label: 'Teléfono' }
];

/** Drives both the Dashboard notice and the "Mi organización" view, so the
 *  two can never disagree about what counts as missing. */
export function getOrgMissingFields(org?: Organization): OrgProfileField[] {
  if (!org) return [];
  return ORG_PROFILE_FIELDS.filter(f => !(org[f.key] || '').toString().trim());
}


export const INITIAL_USERS: UserMember[] = [
  // Platform-level account, deliberately outside every tenant: the Super Admin
  // administers the WooX platform and its organizations rather than belonging
  // to one. `organization` is absent on purpose — the Super Admin experience
  // must never show a tenant as their own.
  {
    id: 1,
    name: 'Enrique Macias',
    firstName: 'Enrique',
    lastName: 'Macias',
    position: 'Super Admin · WooX Platform',
    phone: '+52 871 440 2199',
    email: 'enrique@woox.mx',
    role: 'Super Admin (SA)',
    status: 'Activo',
    lastAccess: 'hoy, 09:12',
    initials: 'EM',
    avatarBg: 'var(--accent)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  // Owner and Manager of KUM S.A.
  {
    id: 5,
    name: 'Pedro Barcellona',
    firstName: 'Pedro',
    lastName: 'Barcellona',
    position: 'Gerente Comercial',
    phone: '+52 871 512 7730',
    email: 'pedro@garin.mx',
    role: 'Manager',
    organization: 'KUM S.A',
    status: 'Activo',
    lastAccess: 'hoy, 09:05',
    initials: 'PB',
    avatarBg: 'var(--primary)',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Diego',
    firstName: 'Diego',
    lastName: 'Valenzuela',
    position: 'Asesor Comercial B2B',
    phone: '+52 871 123 4567',
    email: 'diego@garin.mx',
    role: 'Rep',
    organization: 'KUM S.A',
    status: 'Activo',
    lastAccess: 'hoy, 10:44',
    initials: 'D',
    avatarBg: 'var(--info)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Maria Torres',
    firstName: 'Maria',
    lastName: 'Torres',
    position: 'Ejecutiva de Cuentas Clave',
    phone: '+52 871 987 6543',
    email: 'maria@garin.mx',
    role: 'Rep',
    organization: 'KUM S.A',
    status: 'Activo',
    lastAccess: 'hoy, 08:57',
    initials: 'M',
    avatarBg: 'var(--orange)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Adamaris',
    firstName: 'Adamaris',
    lastName: 'Gómez',
    position: 'Asesora de Ventas Retail & Obras',
    phone: '+52 871 554 3322',
    email: 'adamaris@garin.mx',
    role: 'Rep',
    organization: 'KUM S.A',
    status: 'Activo',
    lastAccess: 'ayer, 18:30',
    initials: 'A',
    avatarBg: 'var(--storm-deep)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
,

  // --- Tenants de demo: Owners y equipos de las otras organizaciones de la
  // plataforma. Existen para que el panel del Super Admin se vea como una
  // plataforma en uso y no como una sola fila. ---
  {
    id: 20,
    name: 'Rocío Alcántara',
    firstName: 'Rocío',
    lastName: 'Alcántara',
    position: 'Directora General',
    phone: '+52 81 8140 2277',
    email: 'roc.alcantara@aceval.mx',
    role: 'Manager',
    organization: 'Distribuidora Aceval S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 08:15',
    initials: 'RA',
    avatarBg: 'var(--primary)'
  },
  {
    id: 21,
    name: 'Gustavo Berrocal',
    firstName: 'Gustavo',
    lastName: 'Berrocal',
    position: 'Gerente General',
    phone: '+52 614 415 8890',
    email: 'g.berrocal@elancla.mx',
    role: 'Manager',
    organization: 'Grupo Ferretero del Norte S.A.',
    status: 'Activo',
    lastAccess: 'ayer, 17:40',
    initials: 'GB',
    avatarBg: 'var(--info)'
  },
  {
    id: 22,
    name: 'Nayeli Chan',
    firstName: 'Nayeli',
    lastName: 'Chan',
    position: 'Socia fundadora',
    phone: '+52 999 287 1130',
    email: 'nayeli.chan@yaguara.mx',
    role: 'Manager',
    organization: 'Comercial Yaguará S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 10:02',
    initials: 'NC',
    avatarBg: 'var(--orange)'
  },
  {
    id: 23,
    name: 'Iván Zamudio',
    firstName: 'Iván',
    lastName: 'Zamudio',
    position: 'Director Comercial',
    email: 'i.zamudio@rivega.mx',
    role: 'Manager',
    organization: 'Recubrimientos Industriales Vega S.A.',
    status: 'Invitado',
    lastAccess: 'Pendiente de activación',
    initials: 'IZ',
    avatarBg: 'var(--graphite)'
  },
  {
    id: 24,
    name: 'Lucía Ferrari',
    firstName: 'Lucía',
    lastName: 'Ferrari',
    position: 'Gerente de Tiendas',
    phone: '+52 33 3615 9042',
    email: 'lucia.ferrari@trebolhogar.mx',
    role: 'Manager',
    organization: 'Almacenes Trébol S.A. de C.V.',
    status: 'Activo',
    lastAccess: '2d ago',
    initials: 'LF',
    avatarBg: 'var(--accent)'
  },
  {
    id: 25,
    name: 'Héctor Palomino',
    firstName: 'Héctor',
    lastName: 'Palomino',
    position: 'Director de Operaciones',
    phone: '+52 222 249 3318',
    email: 'h.palomino@miralta.mx',
    role: 'Manager',
    organization: 'Insumos Constructivos Miralta S.A.',
    status: 'Activo',
    lastAccess: 'hoy, 09:31',
    initials: 'HP',
    avatarBg: 'var(--storm-deep)'
  },
  {
    id: 26,
    name: 'Sofía Arriaga',
    firstName: 'Sofía',
    lastName: 'Arriaga',
    position: 'Gerente Comercial',
    phone: '+52 477 718 6624',
    email: 'sofia.arriaga@pintubajio.mx',
    role: 'Manager',
    organization: 'Pinturas y Solventes del Bajío S.A.',
    status: 'Activo',
    lastAccess: '3d ago',
    initials: 'SA',
    avatarBg: 'var(--primary)'
  },
  {
    id: 27,
    name: 'Bruno Sandoval',
    firstName: 'Bruno',
    lastName: 'Sandoval',
    position: 'Director General',
    phone: '+52 55 5280 7715',
    email: 'b.sandoval@santamarina.mx',
    role: 'Manager',
    organization: 'Corporativo Santamarina S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 07:58',
    initials: 'BS',
    avatarBg: 'var(--info)'
  },
  {
    id: 28,
    name: 'Verónica Quintanilla',
    firstName: 'Verónica',
    lastName: 'Quintanilla',
    position: 'Gerente de Sucursal',
    email: 'v.quintanilla@aurora-ac.mx',
    role: 'Manager',
    organization: 'Suministros Aurora S.A.',
    status: 'Invitado',
    lastAccess: 'Pendiente de activación',
    initials: 'VQ',
    avatarBg: 'var(--graphite)'
  },
  {
    id: 29,
    name: 'Andrés Loera',
    firstName: 'Andrés',
    lastName: 'Loera',
    position: 'Socio Director',
    phone: '+52 662 213 4408',
    email: 'a.loera@cimarron.mx',
    role: 'Manager',
    organization: 'Grupo Cimarrón S.A. de C.V.',
    status: 'Activo',
    lastAccess: '5d ago',
    initials: 'AL',
    avatarBg: 'var(--orange)'
  },
  {
    id: 30,
    name: 'Marisol Tejada',
    firstName: 'Marisol',
    lastName: 'Tejada',
    position: 'Asesora Comercial',
    phone: '+52 81 8140 2281',
    email: 'm.tejada@aceval.mx',
    role: 'Rep',
    organization: 'Distribuidora Aceval S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 09:44',
    initials: 'MT',
    avatarBg: 'var(--orange)'
  },
  {
    id: 31,
    name: 'Fermín Oyarzún',
    firstName: 'Fermín',
    lastName: 'Oyarzún',
    position: 'Asesor de Obra',
    phone: '+52 81 8140 2290',
    email: 'f.oyarzun@aceval.mx',
    role: 'Rep',
    organization: 'Distribuidora Aceval S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'ayer, 16:12',
    initials: 'FO',
    avatarBg: 'var(--info)'
  },
  {
    id: 32,
    name: 'Camila Restrepo',
    firstName: 'Camila',
    lastName: 'Restrepo',
    position: 'Ejecutiva de Cuentas',
    phone: '+52 55 5280 7720',
    email: 'c.restrepo@santamarina.mx',
    role: 'Rep',
    organization: 'Corporativo Santamarina S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 11:05',
    initials: 'CR',
    avatarBg: 'var(--accent)'
  },
  {
    id: 33,
    name: 'Tomás Ibáñez',
    firstName: 'Tomás',
    lastName: 'Ibáñez',
    position: 'Gerente Regional',
    phone: '+52 55 5280 7733',
    email: 't.ibanez@santamarina.mx',
    role: 'Manager',
    organization: 'Corporativo Santamarina S.A. de C.V.',
    status: 'Activo',
    lastAccess: '2d ago',
    initials: 'TI',
    avatarBg: 'var(--primary)'
  },
  {
    id: 34,
    name: 'Rubén Etchegaray',
    firstName: 'Rubén',
    lastName: 'Etchegaray',
    position: 'Asesor Comercial',
    email: 'r.etchegaray@trebolhogar.mx',
    role: 'Rep',
    organization: 'Almacenes Trébol S.A. de C.V.',
    status: 'Inactivo',
    lastAccess: 'hace 3 semanas',
    initials: 'RE',
    avatarBg: 'var(--graphite)'
  }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    name: 'KUM S.A',
    tradeName: 'Pinturerias Garin',
    ownerId: 5, // Pedro Barcellona, ver INITIAL_USERS
    address: 'Torreón, Coahuila',
    createdAt: '2026-06-01'
  },

  // --- Otras organizaciones de la plataforma. Cada una tiene a propósito un
  // grado distinto de completitud: algunas con ficha completa, otras recién
  // dadas de alta con lo mínimo. Sirve para demostrar el panel del Super
  // Admin sobre datos que se parecen a los reales. ---
  {
    id: 2,
    name: 'Distribuidora Aceval S.A. de C.V.',
    tradeName: 'Pinturas Aceval',
    ownerId: 20,
    taxId: 'DAC120415H21',
    address: 'Monterrey, Nuevo León',
    email: 'contacto@aceval.mx',
    phone: '+52 81 8140 2277',
    createdAt: '2026-01-19'
  },
  {
    id: 3,
    name: 'Grupo Ferretero del Norte S.A.',
    tradeName: 'Ferretería El Ancla',
    ownerId: 21,
    address: 'Chihuahua, Chihuahua',
    email: 'ventas@elancla.mx',
    phone: '+52 614 415 8890',
    createdAt: '2026-02-03'
  },
  {
    id: 4,
    name: 'Comercial Yaguará S.A. de C.V.',
    tradeName: 'Colores Yaguará',
    ownerId: 22,
    taxId: 'CYA180922J44',
    address: 'Mérida, Yucatán',
    email: 'hola@yaguara.mx',
    phone: '+52 999 287 1130',
    createdAt: '2026-02-27'
  },
  {
    id: 5,
    name: 'Recubrimientos Industriales Vega S.A.',
    ownerId: 23,
    createdAt: '2026-08-11'
  },
  {
    id: 6,
    name: 'Almacenes Trébol S.A. de C.V.',
    tradeName: 'Trébol Hogar',
    ownerId: 24,
    taxId: 'ATR050716M08',
    address: 'Guadalajara, Jalisco',
    email: 'compras@trebolhogar.mx',
    createdAt: '2026-03-14'
  },
  {
    id: 7,
    name: 'Insumos Constructivos Miralta S.A.',
    tradeName: 'Miralta Obra',
    ownerId: 25,
    taxId: 'ICM110228K73',
    address: 'Puebla, Puebla',
    email: 'contacto@miralta.mx',
    phone: '+52 222 249 3318',
    createdAt: '2026-04-02'
  },
  {
    id: 8,
    name: 'Pinturas y Solventes del Bajío S.A.',
    tradeName: 'PintuBajío',
    ownerId: 26,
    taxId: 'PSB990310B15',
    address: 'León, Guanajuato',
    phone: '+52 477 718 6624',
    createdAt: '2026-04-25'
  },
  {
    id: 9,
    name: 'Corporativo Santamarina S.A. de C.V.',
    tradeName: 'Santamarina Decoración',
    ownerId: 27,
    taxId: 'CSA021105R60',
    address: 'Ciudad de México',
    email: 'recepcion@santamarina.mx',
    phone: '+52 55 5280 7715',
    createdAt: '2026-05-08'
  },
  {
    id: 10,
    name: 'Suministros Aurora S.A.',
    tradeName: 'Aurora Acabados',
    ownerId: 28,
    address: 'Tijuana, Baja California',
    createdAt: '2026-07-30'
  },
  {
    id: 11,
    name: 'Grupo Cimarrón S.A. de C.V.',
    tradeName: 'Cimarrón Pinturas',
    ownerId: 29,
    address: 'Hermosillo, Sonora',
    email: 'info@cimarron.mx',
    createdAt: '2026-06-17'
  }
];

// Unified Notes & Documents seed data. Previously these lived as two
// separate hard-coded arrays, one inside LeadDetailView's local state (shown
// for whichever contact happened to be open, with the text interpolating
// that contact's own fields) and one inside OpportunityDetailView's local
// state (same thing, per opportunity) — neither was actually tied to a real
// record. Migrating them here means picking one real anchor rather than
// inventing new content: the opportunity notes' own fallback text already
// named "Ana Torres" and "3 terrazas", which is contact id 0 and opportunity
// id 0 ("Acabado exterior — 3 terrazas") — so both pairs are seeded against
// that pair, preserving every note that existed before.
export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'cn-mgr-1',
    contactId: 0,
    author: 'Pedro Barcellona',
    initials: 'EM',
    time: 'ayer, 16:30',
    createdAtTimestamp: Date.now() - 25 * 3600 * 1000,
    text: 'Revisé los requerimientos iniciales para el proyecto. Se adjunta el resumen técnico y la ficha comercial para coordinar con el equipo.',
    avatarBg: 'var(--accent)',
    attachments: [
      { id: 'att-1', name: 'Especificaciones_Proyecto_2026.pdf', size: '1.4 MB', type: 'pdf' },
      { id: 'att-2', name: 'Requerimientos_Catalogo.xlsx', size: '620 KB', type: 'sheet' }
    ]
  },
  {
    id: 'cn-2',
    contactId: 0,
    author: 'Sistema Comercial',
    initials: 'SC',
    time: 'hace 3 días',
    createdAtTimestamp: Date.now() - 72 * 3600 * 1000,
    text: 'Contacto registrado exitosamente mediante B2B. Datos de contacto verificados.',
    avatarBg: 'var(--accent-soft-2)'
  },
  {
    id: 'on-1',
    contactId: 0,
    opportunityId: 0,
    author: 'Diego',
    initials: 'D',
    time: 'hoy, 10:42',
    createdAtTimestamp: Date.now() - 2 * 3600 * 1000,
    text: 'Ana Torres confirmó que necesita el acabado para exteriores en 3 terrazas del hotel. Pidió cotización con envío a Playa del Carmen.',
    avatarBg: 'var(--accent-soft-2)',
    attachments: [
      { id: 'att-opp-1', name: 'Ficha_Tecnica_Acabado_Exterior.pdf', size: '1.8 MB', type: 'pdf' },
      { id: 'att-opp-2', name: 'Foto_Terraza_AnaTorres.jpg', size: '850 KB', type: 'image' }
    ]
  },
  {
    id: 'on-2',
    contactId: 0,
    opportunityId: 0,
    author: 'Diego',
    initials: 'D',
    time: 'ayer, 17:05',
    createdAtTimestamp: Date.now() - 24 * 3600 * 1000,
    text: 'Primer contacto por Instagram. Preguntó por el producto estrella para madera exterior, mandé fotos del acabado.',
    avatarBg: 'var(--accent-soft-2)'
  }
];

const NOTE_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Shared by every Notes & Documents surface (Contact view, Opportunity
 *  view) so the 24-hour edit/delete window can't drift between them. */
export function isNoteEditable(note: NoteItem): boolean {
  if (!note.createdAtTimestamp) return false;
  return Date.now() - note.createdAtTimestamp <= NOTE_EDIT_WINDOW_MS;
}

export function getNoteRemainingMinutes(note: NoteItem): number {
  if (!note.createdAtTimestamp) return 0;
  const remaining = NOTE_EDIT_WINDOW_MS - (Date.now() - note.createdAtTimestamp);
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
}

/** Human-readable countdown for the same window: hours while there's more
 *  than an hour left, minutes once it's down to the final stretch — so it
 *  reads "23 h para editar" right after creation and "45 min para editar"
 *  as it's about to lock, instead of showing raw minutes the whole time. */
export function formatNoteRemainingTime(note: NoteItem): string {
  const minutes = getNoteRemainingMinutes(note);
  if (minutes > 60) {
    return `${Math.ceil(minutes / 60)} h para editar`;
  }
  return `${minutes} min para editar`;
}

/** Fixed palette of categorical identity colors (deliberately distinct from
 *  the stage badge colors — this axis means "which opportunity", not "what
 *  stage") shared by the note tag pill (NotesAndFiles.tsx) and the related-
 *  opportunities dot (LeadDetailView.tsx), so the same opportunity always
 *  reads as the same color in both places. */
export const OPPORTUNITY_TAG_COLOR_COUNT = 6;

/** Assigns a stable color slot (0..OPPORTUNITY_TAG_COLOR_COUNT-1) to an
 *  opportunity based on its position within the given list — callers must
 *  pass the same list (e.g. a contact's related opportunities) so the same
 *  opportunity always lands on the same slot everywhere it's shown. */
export function getOpportunityColorIndex(opportunities: { id: number }[], opportunityId: number): number {
  const index = opportunities.findIndex(o => o.id === opportunityId);
  return (index < 0 ? 0 : index) % OPPORTUNITY_TAG_COLOR_COUNT;
}

export const INITIAL_DASHBOARD_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'a1',
    initial: 'D',
    type: 'rep',
    author: 'Diego',
    action: 'movió',
    highlight: 'Acabado exterior — 3 terrazas a Negociación',
    when: 'hace 12 min',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'a2',
    initial: 'IA',
    type: 'ai',
    author: 'IA',
    action: 'generó una sugerencia de respuesta para',
    highlight: 'Suministro pintura industrial',
    when: 'hace 25 min'
  },
  {
    id: 'a3',
    initial: 'M',
    type: 'rep',
    author: 'Maria Torres',
    action: 'añadió una nota a',
    highlight: 'Contratista García',
    when: 'hace 1 h',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'a4',
    initial: 'S',
    type: 'sys',
    author: 'Sistema',
    action: 'creó un nuevo lead desde Instagram',
    when: 'hace 2 h'
  },
  {
    id: 'a5',
    initial: 'A',
    type: 'rep',
    author: 'Adamaris',
    action: 'marcó',
    highlight: 'Compra mostrador como Ganado',
    when: 'hace 3 h',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

export const AI_SUGGESTIONS = [
  '"Hola Ana, gracias por tu paciencia. Con base en lo que platicamos, el acabado para madera exterior que buscas cubre perfectamente las terrazas del hotel — te puedo preparar la cotización con el volumen que necesites y el tiempo de entrega a Quintana Roo. ¿Seguimos con eso?"',
  '"Hola Ana, te comparto que el acabado tiene garantía de 1 año y rinde muy bien en exteriores frente al mar. Si me confirmas el metraje de las 3 terrazas te preparo la cotización hoy mismo."',
  '"Ana, quedo al pendiente de la cotización — en cuanto confirmes cantidad y punto de entrega en Playa del Carmen te la envío junto con el costo de envío ya calculado."'
];

export function formatMoney(n: number | null | undefined): string {
  if (n == null) return 'sin valor';
  return '$' + n.toLocaleString('es-MX');
}
