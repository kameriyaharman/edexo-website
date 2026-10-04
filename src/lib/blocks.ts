/**
 * Page sections ("blocks") for long landing pages such as Ausbildung and Study in Germany.
 * Stored as JSON on pages.sections and edited in Admin → Pages with the sections editor.
 *
 * Line conventions inside `items` (one per line):
 *   cards / ticks / chips / grid  →  "Title — optional description"
 *   steps / path / timeline       →  "Step title — optional description"
 *   faq                           →  "Question :: Answer"
 *   buttons (hero, cta)           →  "Label | link"   link may be a path, a #anchor, or "whatsapp"
 *   links                         →  "Label | https://…"
 */
export const BLOCK_TYPES = {
  hero: 'Hero (big heading + buttons)',
  text: 'Text',
  cards: 'Cards',
  ticks: 'Tick list',
  chips: 'Chips / tags',
  path: 'Path (A → B → C)',
  steps: 'Process timeline',
  timeline: 'Dates / intakes',
  split: 'Two columns (compare)',
  note: 'Highlighted note / update',
  package: 'Package card',
  form: 'Eligibility form',
  cta: 'Call-to-action band',
  faq: 'FAQs',
  links: 'Links / sources',
} as const;
export type BlockType = keyof typeof BLOCK_TYPES;

export type Column = { title: string; text: string; items: string };
export type Block = {
  id: string;
  type: BlockType;
  eyebrow?: string;
  title?: string;
  text?: string;
  items?: string;
  /** buttons for hero / cta / package, one "Label | link" per line */
  buttons?: string;
  /** split blocks */
  columns?: Column[];
  /** form block: which form */
  form?: 'ausbildung' | 'study';
  /** note tone */
  tone?: 'info' | 'update' | 'warning';
  tint?: boolean;
  hidden?: boolean;
};

export const FORM_KINDS = { ausbildung: 'Ausbildung eligibility', study: 'Study in Germany eligibility' } as const;

const str = (v: unknown, n = 8000) => (typeof v === 'string' ? v.slice(0, n) : '');

/** Clean untrusted JSON from the admin form into a list of blocks. */
export function normalizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 80).flatMap((b, i): Block[] => {
    if (!b || typeof b !== 'object') return [];
    const o = b as Record<string, unknown>;
    const type = (Object.keys(BLOCK_TYPES).includes(String(o.type)) ? o.type : 'text') as BlockType;
    const block: Block = {
      id: str(o.id, 40) || `b${i}-${Math.random().toString(36).slice(2, 7)}`,
      type, eyebrow: str(o.eyebrow, 120), title: str(o.title, 300), text: str(o.text), items: str(o.items, 20000),
      buttons: str(o.buttons, 2000), tint: o.tint === true, hidden: o.hidden === true,
    };
    if (type === 'split') {
      block.columns = (Array.isArray(o.columns) ? o.columns : []).slice(0, 4).map((c) => {
        const x = (c ?? {}) as Record<string, unknown>;
        return { title: str(x.title, 300), text: str(x.text), items: str(x.items, 8000) };
      });
    }
    if (type === 'form') block.form = o.form === 'study' ? 'study' : 'ausbildung';
    if (type === 'note') block.tone = o.tone === 'update' || o.tone === 'warning' ? o.tone : 'info';
    return [block];
  });
}

export const lines = (v?: string) => (v ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
export const splitDash = (l: string) => {
  const i = l.indexOf(' — ');
  return i === -1 ? [l, ''] : [l.slice(0, i), l.slice(i + 3)];
};
export const splitPipe = (l: string) => {
  const i = l.lastIndexOf('|');
  return i === -1 ? [l.trim(), ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
};
export const faqItems = (v?: string) => lines(v).map((l) => {
  const i = l.indexOf('::');
  return i === -1 ? null : { q: l.slice(0, i).trim(), a: l.slice(i + 2).trim() };
}).filter((x): x is { q: string; a: string } => !!x && !!x.q && !!x.a);
