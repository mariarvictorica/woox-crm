import { Contact, Opportunity, UserMember, ActivityEvent, StageKey, Organization, NoteItem } from '../types';

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
    rep: 'Maribel',
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
    rep: 'Maribel',
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
    rep: 'Maribel',
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
    rep: 'Maribel',
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
    rep: 'Maribel',
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
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'EM',
    avatarBg: 'var(--accent)'
  },
  'Enrique': {
    name: 'Enrique Macias',
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'EM',
    avatarBg: 'var(--accent)'
  },
  'Diego': {
    name: 'Diego',
    role: 'Vendedor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    initials: 'D',
    avatarBg: 'var(--info)'
  },
  'Maribel': {
    name: 'Maribel',
    role: 'Vendedora',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    initials: 'M',
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

export const ORGANIZATIONS_LIST = [
  'Woox Pinturas y Acabados S.A. de C.V.',
  'Woox Sureste (Cancún & Riviera)',
  'Woox Norte (Torreón & Monterrey)',
  'Woox Centro (CDMX & Guadalajara)'
];

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

export const USER_ROLES_LIST = [
  { value: 'Rep', label: 'Rep', desc: 'Asesor comercial para atención de leads y oportunidades' },
  { value: 'Manager', label: 'Manager', desc: 'Supervisión de equipo, reportes y gestión comercial' }
];

export const INITIAL_USERS: UserMember[] = [
  {
    id: 1,
    name: 'Enrique Macias',
    firstName: 'Enrique',
    lastName: 'Macias',
    position: 'Sales Director & Manager',
    phone: '+52 871 440 2199',
    email: 'enrique@woox.mx',
    role: 'Manager',
    organization: 'Woox Pinturas y Acabados S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 09:12',
    initials: 'EM',
    avatarBg: 'var(--accent)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Diego',
    firstName: 'Diego',
    lastName: 'Valenzuela',
    position: 'Asesor Comercial B2B',
    phone: '+52 871 123 4567',
    email: 'diego@woox.mx',
    role: 'Rep',
    organization: 'Woox Pinturas y Acabados S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'hoy, 10:44',
    initials: 'D',
    avatarBg: 'var(--info)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Maribel',
    firstName: 'Maribel',
    lastName: 'Orozco',
    position: 'Ejecutiva de Cuentas Clave',
    phone: '+52 871 987 6543',
    email: 'maribel@woox.mx',
    role: 'Rep',
    organization: 'Woox Pinturas y Acabados S.A. de C.V.',
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
    email: 'adamaris@woox.mx',
    role: 'Rep',
    organization: 'Woox Pinturas y Acabados S.A. de C.V.',
    status: 'Activo',
    lastAccess: 'ayer, 18:30',
    initials: 'A',
    avatarBg: 'var(--storm-deep)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    name: 'Woox Pinturas y Acabados S.A. de C.V.',
    tradeName: 'WooX',
    ownerId: 1, // Enrique Macias, ver INITIAL_USERS
    address: 'Torreón, Coahuila',
    createdAt: '2026-06-01'
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
    author: 'Enrique Macias',
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
    author: 'Maribel',
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
