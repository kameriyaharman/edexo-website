'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { BLOCK_TYPES, FORM_KINDS, type Block, type BlockType } from '@/lib/blocks';

const HELP: Partial<Record<BlockType, string>> = {
  hero: 'Points: short ticks under the buttons. Buttons: "Label | link" per line — link can be /page, #eligibility, #counselling or whatsapp.',
  cards: 'One card per line. Optional description after " — " (space, long dash, space).',
  ticks: 'One item per line. Optional description after " — ".',
  chips: 'One tag per line.',
  path: 'One step per line, e.g. A1, A2, B1…',
  steps: 'One step per line, in order. Optional description after " — ".',
  timeline: 'One date per line: "Summer Intake 2027 — text".',
  note: 'Use for updates that may change (APS rules, test dates…).',
  package: 'Points: what the package includes. Buttons: "Label | link".',
  form: 'Shows the eligibility form. "Buttons" holds the message shown after submitting.',
  cta: 'Buttons: "Label | link" per line.',
  faq: 'One FAQ per line: "Question :: Answer".',
  links: 'One link per line: "Label | https://…".',
};

const uid = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Visual editor for page sections; writes JSON into a hidden input named `name`. */
export function BlocksEditor({ name, value }: { name: string; value: unknown }) {
  const [blocks, setBlocks] = useState<Block[]>(Array.isArray(value) ? (value as Block[]) : []);
  const [open, setOpen] = useState<string | null>(null);
  const [addType, setAddType] = useState<BlockType>('cards');
  const set = (i: number, patch: Partial<Block>) => setBlocks((b) => b.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => setBlocks((b) => {
    const j = i + d; if (j < 0 || j >= b.length) return b;
    const c = [...b]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const touch = () => document.querySelector(`input[name="${name}"]`)?.dispatchEvent(new Event('change', { bubbles: true }));

  const field = (i: number, k: keyof Block, label: string, rows = 0, ph = '') => (
    <label className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-input-wrap">
        {rows ? (
          <textarea className="a-input" rows={rows} value={String(blocks[i][k] ?? '')} placeholder={ph} onChange={(e) => { set(i, { [k]: e.target.value } as Partial<Block>); touch(); }} />
        ) : (
          <input className="a-input" value={String(blocks[i][k] ?? '')} placeholder={ph} onChange={(e) => { set(i, { [k]: e.target.value } as Partial<Block>); touch(); }} />
        )}
      </div>
    </label>
  );

  return (
    <div className="a-blocks">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} readOnly />
      {blocks.length === 0 && <p className="a-help">No sections yet. Add the first one below.</p>}
      {blocks.map((b, i) => {
        const isOpen = open === b.id;
        return (
          <div className={`a-block${b.hidden ? ' is-hidden' : ''}${isOpen ? ' open' : ''}`} key={b.id}>
            <div className="a-block-head">
              <button type="button" className="a-block-title" onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen}>
                <span className="a-block-n">{i + 1}</span>
                <span className="a-block-type">{BLOCK_TYPES[b.type] ?? b.type}</span>
                <strong>{b.title || b.columns?.map((c) => c.title).filter(Boolean).join(' / ') || '(no title)'}</strong>
                {b.hidden && <span className="pill-s off">Hidden</span>}
              </button>
              <div className="a-block-actions">
                <button type="button" className="a-btn sm" onClick={() => { move(i, -1); touch(); }} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" className="a-btn sm" onClick={() => { move(i, 1); touch(); }} disabled={i === blocks.length - 1} aria-label="Move down">↓</button>
                <button type="button" className="a-btn sm" onClick={() => { set(i, { hidden: !b.hidden }); touch(); }}>{b.hidden ? 'Show' : 'Hide'}</button>
                <button type="button" className="a-btn sm danger" onClick={() => { if (confirm('Delete this section?')) { setBlocks((x) => x.filter((_, j) => j !== i)); touch(); } }} aria-label="Delete">✕</button>
              </div>
            </div>
            {isOpen && (
              <div className="a-block-body">
                {HELP[b.type] && <p className="a-help">{HELP[b.type]}</p>}
                <div className="a-fields">
                  {b.type !== 'cta' && b.type !== 'links' && field(i, 'eyebrow', 'Small label above the heading')}
                  {field(i, 'title', 'Heading')}
                  {b.type !== 'split' && field(i, 'text', b.type === 'hero' ? 'Intro text' : 'Text (markdown allowed: **bold**, lists)', 4)}
                  {['hero', 'cards', 'ticks', 'chips', 'path', 'steps', 'timeline', 'note', 'package', 'form', 'faq', 'links', 'text'].includes(b.type) &&
                    field(i, 'items', b.type === 'faq' ? 'FAQs (Question :: Answer)' : b.type === 'form' ? 'Tick points beside the form' : b.type === 'hero' ? 'Tick points' : 'Items (one per line)', 8)}
                  {['hero', 'cta', 'package', 'cards', 'chips'].includes(b.type) && field(i, 'buttons', 'Buttons (Label | link)', 3, 'Book Free Counselling | #counselling')}
                  {b.type === 'form' && (
                    <>
                      <label className="a-field"><span className="a-label">Which form</span>
                        <div className="a-input-wrap is-select">
                          <select className="a-input" value={b.form ?? 'ausbildung'} onChange={(e) => { set(i, { form: e.target.value as Block['form'] }); touch(); }}>
                            {Object.entries(FORM_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </select>
                        </div>
                      </label>
                      {field(i, 'buttons', 'Message after submitting', 2)}
                    </>
                  )}
                  {b.type === 'note' && (
                    <label className="a-field"><span className="a-label">Style</span>
                      <div className="a-input-wrap is-select">
                        <select className="a-input" value={b.tone ?? 'info'} onChange={(e) => { set(i, { tone: e.target.value as Block['tone'] }); touch(); }}>
                          <option value="info">Information (blue)</option><option value="update">Latest update (orange)</option><option value="warning">Important (red)</option>
                        </select>
                      </div>
                    </label>
                  )}
                  {b.type !== 'hero' && b.type !== 'cta' && b.type !== 'form' && (
                    <label className="a-switch-row" style={{ alignSelf: 'end' }}>
                      <span>Tinted background</span>
                      <input type="checkbox" className="a-switch-input" checked={!!b.tint} onChange={(e) => { set(i, { tint: e.target.checked }); touch(); }} />
                      <span className="a-switch" aria-hidden="true" />
                    </label>
                  )}
                </div>
                {b.type === 'split' && (
                  <div className="a-cols">
                    {(b.columns ?? []).map((c, ci) => (
                      <div className="a-col" key={ci}>
                        <div className="a-col-head"><strong>Column {ci + 1}</strong>
                          <button type="button" className="a-btn sm danger" onClick={() => { set(i, { columns: (b.columns ?? []).filter((_, j) => j !== ci) }); touch(); }}>Remove</button>
                        </div>
                        {(['title', 'text', 'items'] as const).map((k) => (
                          <label className="a-field" key={k}><span className="a-label">{k === 'title' ? 'Heading' : k === 'text' ? 'Text' : 'Tick points (one per line)'}</span>
                            <div className="a-input-wrap">
                              {k === 'title'
                                ? <input className="a-input" value={c[k]} onChange={(e) => { const cols = [...(b.columns ?? [])]; cols[ci] = { ...c, [k]: e.target.value }; set(i, { columns: cols }); touch(); }} />
                                : <textarea className="a-input" rows={k === 'text' ? 4 : 5} value={c[k]} onChange={(e) => { const cols = [...(b.columns ?? [])]; cols[ci] = { ...c, [k]: e.target.value }; set(i, { columns: cols }); touch(); }} />}
                            </div>
                          </label>
                        ))}
                      </div>
                    ))}
                    {(b.columns?.length ?? 0) < 3 && (
                      <button type="button" className="a-btn sm" onClick={() => { set(i, { columns: [...(b.columns ?? []), { title: '', text: '', items: '' }] }); touch(); }}>+ Add column</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="a-block-add">
        <div className="a-input-wrap is-select">
          <select className="a-input" value={addType} onChange={(e) => setAddType(e.target.value as BlockType)} aria-label="Section type">
            {Object.entries(BLOCK_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <button type="button" className="a-btn primary sm" onClick={() => {
          const nb: Block = { id: uid(), type: addType, title: '', ...(addType === 'split' ? { columns: [{ title: '', text: '', items: '' }, { title: '', text: '', items: '' }] } : {}) };
          setBlocks((b) => [...b, nb]); setOpen(nb.id); touch();
        }}><Icon name="plus" size={14} />Add section</button>
      </div>
    </div>
  );
}
