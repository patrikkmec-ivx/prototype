/**
 * hilbi-sdk.ts — Care Plan UI Bridge client (cp-20 protocol v1)
 *
 * Copy this file into the plan project. It is deliberately NOT an npm package:
 * plans are static Vite builds, and a shared dependency would mean publishing,
 * versioning and rebuilding every plan for any change. Copies drift, and the
 * handshake is what makes drift survivable — see `caps()` below.
 *
 * The cockpit renders; this plan describes. A plan MUST stay usable standalone,
 * because it is also served directly at its own URL. `hilbi.available()` is the
 * switch: false means render inline as before.
 *
 * No dependencies. No side effects until connect() is called.
 */

export type Surface = 'modal' | 'sheet' | 'confirm' | 'toast' | 'passthrough';

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect'
  | 'checkbox' | 'scale' | 'result' | 'display' | 'group';

export interface Option { value: string; label: string }

export interface Condition {
  key: string;
  op: 'eq' | 'ne' | 'includes' | 'gt' | 'lt' | 'truthy';
  value?: unknown;
}

export interface Field {
  key: string;
  type: FieldType;
  label: string;
  help?: string;
  required?: boolean;
  readOnly?: boolean;
  default?: unknown;
  dependsOn?: Condition;
  /* text / textarea */
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  /* number / scale */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  precision?: number;
  refRange?: { low: number; high: number };
  labels?: Record<number, string>;
  /* select / multiselect */
  options?: Array<string | Option>;
  /* result */
  posLabel?: string;
  negLabel?: string;
  /* display */
  value?: string | number | null;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  /* group */
  repeatable?: { min?: number; max?: number; addLabel?: string };
  fields?: Field[];
}

export interface Section { key: string; title: string; fields: Field[] }

export interface Action {
  key: string;
  label: string;
  tone?: 'primary' | 'default' | 'ghost' | 'danger';
  dismiss?: boolean;
}

export interface OpenRequest {
  surface: Surface;
  title?: string;
  subtitle?: string;
  sections?: Section[];
  fields?: Field[];
  actions?: Action[];
  /** passthrough only; MUST be same-origin as the plan */
  url?: string;
}

export interface OpenResult {
  action: string | null;
  dismissed: boolean;
  values: Record<string, unknown> | null;
}

export interface Caps {
  surfaces: Surface[];
  fields: FieldType[];
  locale?: string;
  cockpit?: string;
}

export class BridgeError extends Error {
  code: string;
  constructor(code: string, detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
  }
}

const V = 1;
const HANDSHAKE_TIMEOUT_MS = 2000;

let connected = false;
let caps: Caps | null = null;
let seq = 0;
const pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();

const nextId = () => `p${Date.now().toString(36)}${(seq++).toString(36)}`;

function post(msg: Record<string, unknown>) {
  if (window.parent === window) return;
  // '*' is safe here only because the payload carries no secrets and the cockpit
  // verifies OUR origin on receipt. Never send patient data with '*'.
  window.parent.postMessage(msg, '*');
}

function onMessage(ev: MessageEvent) {
  const m = ev.data;
  if (!m || typeof m !== 'object' || typeof m.type !== 'string') return;
  const p = pending.get(m.id);
  if (!p) return;
  pending.delete(m.id);
  if (m.type === 'ui.error') p.reject(new BridgeError(m.code, m.detail));
  else p.resolve(m);
}

function request<T>(msg: Record<string, unknown>, timeoutMs?: number): Promise<T> {
  const id = nextId();
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    if (timeoutMs) {
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new BridgeError('timeout'));
        }
      }, timeoutMs);
    }
    post({ ...msg, v: V, id });
  });
}

/**
 * Announce this plan and learn what the cockpit supports.
 * Resolves false when there is no cockpit — render inline in that case.
 * Safe to call more than once; the result is cached.
 */
export async function connect(plan: string, sdk = '1.0.0'): Promise<boolean> {
  if (connected) return true;
  if (window.parent === window) return false;   // standalone
  window.addEventListener('message', onMessage, false);
  try {
    const r = await request<any>(
      { type: 'ready', plan, sdk,
        supports: { surfaces: ['modal', 'sheet', 'confirm', 'toast', 'passthrough'] } },
      HANDSHAKE_TIMEOUT_MS,
    );
    caps = { ...r.supports, locale: r.locale, cockpit: r.cockpit };
    connected = true;
    return true;
  } catch {
    window.removeEventListener('message', onMessage, false);
    return false;                                // no bridge — fall back inline
  }
}

export const available = () => connected;
export const capabilities = () => caps;

/** Degrade rather than fail: an unsupported surface must not break the plan. */
function pickSurface(want: Surface): Surface | null {
  if (!caps) return null;
  if (caps.surfaces.includes(want)) return want;
  const fallback: Record<Surface, Surface[]> = {
    sheet: ['modal'], modal: ['sheet'], confirm: ['modal', 'sheet'],
    toast: [], passthrough: [],
  };
  return fallback[want].find((s) => caps!.surfaces.includes(s)) ?? null;
}

/** An unsupported field type degrades to text rather than disappearing. */
function coerce(f: Field): Field {
  if (!caps || caps.fields.includes(f.type)) {
    return f.type === 'group' && f.fields ? { ...f, fields: f.fields.map(coerce) } : f;
  }
  return { ...f, type: 'text', help: f.help };
}

/**
 * Open a cockpit-rendered surface. Resolves when the user acts.
 * Throws BridgeError('no_bridge') when standalone — check available() first.
 */
export async function open(req: OpenRequest): Promise<OpenResult> {
  if (!connected) throw new BridgeError('no_bridge');
  const surface = pickSurface(req.surface);
  if (!surface) throw new BridgeError('unsupported_surface', req.surface);
  const body: OpenRequest = {
    ...req,
    surface,
    fields: req.fields?.map(coerce),
    sections: req.sections?.map((s) => ({ ...s, fields: s.fields.map(coerce) })),
  };
  const r = await request<any>({ type: 'ui.open', ...body });
  return { action: r.action, dismissed: r.dismissed, values: r.values };
}

export function confirm(title: string, opts: {
  subtitle?: string; okLabel?: string; cancelLabel?: string; danger?: boolean;
} = {}) {
  return open({
    surface: 'confirm', title, subtitle: opts.subtitle,
    actions: [
      { key: 'ok', label: opts.okLabel ?? 'OK', tone: opts.danger ? 'danger' : 'primary' },
      { key: 'cancel', label: opts.cancelLabel ?? 'Cancel', tone: 'ghost', dismiss: true },
    ],
  }).then((r) => r.action === 'ok');
}

export function toast(title: string, tone?: 'default' | 'danger') {
  return open({ surface: 'toast', title, fields: [], actions: [] })
    .then(() => undefined)
    .catch(() => undefined);   // a toast must never break a flow
}

export type Scope =
  | 'patient.demographics' | 'patient.identifiers'
  | 'encounter.current' | 'practitioner.current';

/**
 * Ask for patient context. The cockpit MAY grant a subset — always handle that.
 * Context never travels in the iframe URL (cp-20 BR-11): a query string reaches
 * gateway logs, the Referer of every outbound request, and browser history.
 */
export async function context(scope: Scope[]): Promise<{ granted: Scope[]; context: any }> {
  if (!connected) throw new BridgeError('no_bridge');
  const r = await request<any>({ type: 'ctx.request', scope });
  return { granted: r.granted ?? [], context: r.context ?? {} };
}

export const hilbi = { connect, available, capabilities, open, confirm, toast, context };
export default hilbi;
