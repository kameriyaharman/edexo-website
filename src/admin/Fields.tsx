'use client';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { Icon } from '@/components/Icon';
import type { FieldDef } from '@/lib/settings';
import type { FormState } from './actions';

export interface FieldProps extends FieldDef { value: unknown; resolvedOptions?: { value: string; label: string }[] }

/** Submit without React's automatic form reset, so typed values survive a validation error. */
export function keepValues(formAction: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
}

/* ---------------- individual inputs ---------------- */

function Switch({ name, label, value, help }: FieldProps) {
  const [on, setOn] = useState(value === undefined ? true : value === true || value === 'true');
  return (
    <label className="a-switch-row">
      <span className="a-switch-text"><span className="a-label">{label}</span>{help && <small className="a-help">{help}</small>}</span>
      <input type="checkbox" role="switch" name={name} checked={on} onChange={(e) => setOn(e.target.checked)} className="a-switch-input" />
      <span className="a-switch" aria-hidden="true"><span /></span>
    </label>
  );
}

function ImageField({ name, label, value, help }: FieldProps) {
  const id = Number(value) || null;
  const [preview, setPreview] = useState<string | null>(id ? `/media/${id}` : null);
  const [fileName, setFileName] = useState('');
  const [removed, setRemoved] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function take(files: FileList | null) {
    const f = files?.[0];
    if (!f || !input.current) return;
    if (!f.type.startsWith('image/')) return;
    const dt = new DataTransfer();
    dt.items.add(f);
    input.current.files = dt.files;
    setPreview(URL.createObjectURL(f));
    setFileName(`${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`);
    setRemoved(false);
  }
  const showing = preview && !removed;
  return (
    <div className="a-field a-wide">
      <span className="a-label">{label}</span>
      <input type="hidden" name={name} value={id ?? ''} />
      {removed && <input type="hidden" name={`${name}__remove`} value="on" />}
      <div
        className={`a-drop${drag ? ' drag' : ''}${showing ? ' has' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }}
      >
        {showing ? (
          <img src={preview!} alt="" />
        ) : (
          <div className="a-drop-empty">
            <span className="a-drop-ic"><Icon name="sparkles" size={22} /></span>
            <strong>Drop an image here</strong>
            <span>or click to browse · PNG, JPG, WEBP up to 8 MB</span>
          </div>
        )}
        <input ref={input} type="file" name={`${name}__file`} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          aria-label={`Upload ${label}`} onChange={(e) => take(e.target.files)} className="a-drop-input" />
      </div>
      <div className="a-drop-bar">
        <span className="a-help">{fileName || (showing ? 'Current image' : help ?? 'Large images are resized automatically.')}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="a-btn sm" onClick={() => input.current?.click()}><Icon name="sparkles" size={14} />{showing ? 'Replace' : 'Choose image'}</button>
          {showing && (
            <button type="button" className="a-btn sm danger" onClick={() => { setRemoved(true); setFileName(''); if (input.current) input.current.value = ''; }}>
              <Icon name="close" size={14} />Remove
            </button>
          )}
          {removed && id && <button type="button" className="a-btn sm" onClick={() => { setRemoved(false); setPreview(`/media/${id}`); }}>Undo</button>}
        </span>
      </div>
    </div>
  );
}

function MarkdownField({ name, label, value, required }: FieldProps) {
  const [text, setText] = useState(value == null ? '' : String(value));
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const ta = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = '', placeholder = 'text', linePrefix = false) {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = text.slice(a, b) || placeholder;
    let insert: string;
    if (linePrefix) insert = sel.split('\n').map((l, i) => before.replace('1', String(i + 1)) + l).join('\n');
    else insert = before + sel + after;
    const next = text.slice(0, a) + insert + text.slice(b);
    setText(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + (linePrefix ? 0 : before.length), a + insert.length - (linePrefix ? 0 : after.length)); });
  }
  const tools: [string, string, () => void][] = [
    ['H2', 'Heading', () => wrap('## ', '', 'Heading', true)],
    ['H3', 'Sub-heading', () => wrap('### ', '', 'Sub-heading', true)],
    ['B', 'Bold', () => wrap('**', '**')],
    ['I', 'Italic', () => wrap('*', '*')],
    ['• List', 'Bullet list', () => wrap('- ', '', 'List item', true)],
    ['1. List', 'Numbered list', () => wrap('1. ', '', 'List item', true)],
    ['Link', 'Link', () => wrap('[', '](https://)', 'link text')],
    ['Quote', 'Quote', () => wrap('> ', '', 'Quote', true)],
  ];
  return (
    <div className="a-field a-wide">
      <span className="a-label">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <div className="a-md-box">
        <div className="a-md-bar">
          <div className="a-md-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>Write</button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button>
          </div>
          {tab === 'write' && (
            <div className="a-md-tools">
              {tools.map(([t, title, fn]) => <button key={t} type="button" title={title} aria-label={title} onClick={fn}>{t}</button>)}
            </div>
          )}
        </div>
        <textarea ref={ta} id={`f-${name}`} name={name} value={text} onChange={(e) => setText(e.target.value)} required={required}
          rows={14} className="a-md" hidden={tab !== 'write'} aria-label={label} />
        {tab === 'preview' && (
          <div className="a-md-preview prose" dangerouslySetInnerHTML={{ __html: (marked.parse(text || '*Nothing to preview yet.*', { async: false, breaks: true }) as string) }} />
        )}
      </div>
    </div>
  );
}

function Counted({ name, value, maxLength, area, required, placeholder }: FieldProps & { area?: boolean }) {
  const [v, setV] = useState(value == null ? '' : String(value));
  const over = maxLength ? v.length > maxLength : false;
  const props = { id: `f-${name}`, name, value: v, required, placeholder, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value) };
  return (
    <>
      {area ? <textarea {...props} rows={3} /> : <input type="text" {...props} />}
      {maxLength && <span className={`a-count${over ? ' over' : ''}`}>{v.length} / {maxLength}</span>}
    </>
  );
}

function toDateInput(v: unknown) {
  if (!v) return '';
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export function Field(p: FieldProps) {
  const { name, label, type, help, required, placeholder, value, prefix, maxLength } = p;
  if (type === 'image') return <ImageField {...p} />;
  if (type === 'boolean') return <Switch {...p} />;
  if (type === 'markdown') return <MarkdownField {...p} />;
  const str = value === null || value === undefined ? '' : String(value);
  let input: React.ReactNode;
  switch (type) {
    case 'textarea':
      input = maxLength ? <Counted {...p} area /> : <textarea id={`f-${name}`} name={name} defaultValue={str} required={required} placeholder={placeholder} rows={3} />;
      break;
    case 'lines':
      input = <textarea id={`f-${name}`} name={name} defaultValue={str} required={required} placeholder={placeholder ?? 'One item per line'} rows={4} />;
      break;
    case 'number':
      input = <input id={`f-${name}`} name={name} type="text" inputMode="numeric" defaultValue={str} required={required} placeholder={placeholder} />;
      break;
    case 'date':
      input = <input id={`f-${name}`} name={name} type="date" defaultValue={toDateInput(value)} required={required} />;
      break;
    case 'select':
      input = (
        <select id={`f-${name}`} name={name} defaultValue={str} required={required}>
          <option value="">— Select —</option>
          {(p.resolvedOptions ?? p.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    default:
      input = maxLength ? <Counted {...p} /> : <input id={`f-${name}`} name={name} type={type === 'url' ? 'url' : 'text'} defaultValue={str} required={required} placeholder={placeholder ?? (type === 'url' ? 'https://' : undefined)} />;
  }
  const wide = type === 'textarea' || type === 'lines';
  return (
    <div className={`a-field${wide ? ' a-wide' : ''}`}>
      <label className="a-label" htmlFor={`f-${name}`}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <div className={`a-input-wrap${prefix ? ' has-prefix' : ''}${type === 'select' ? ' is-select' : ''}`}>
        {prefix && <span className="a-prefix">{prefix}</span>}
        {input}
        {type === 'select' && <span className="a-caret"><Icon name="chevronDown" size={16} /></span>}
      </div>
      {help && <small className="a-help">{help}</small>}
    </div>
  );
}

/* ---------------- layout ---------------- */

function Card({ title, icon, children, collapsible, defaultOpen = true }: { title: string; icon: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean }) {
  if (collapsible) {
    return (
      <details className="a-panel" open={defaultOpen}>
        <summary className="a-panel-head"><span className="a-panel-ic"><Icon name={icon} size={17} /></span>{title}<span className="a-panel-caret"><Icon name="chevronDown" size={16} /></span></summary>
        <div className="a-panel-body">{children}</div>
      </details>
    );
  }
  return (
    <section className="a-panel">
      <div className="a-panel-head"><span className="a-panel-ic"><Icon name={icon} size={17} /></span>{title}</div>
      <div className="a-panel-body">{children}</div>
    </section>
  );
}

function groupFields(fields: FieldProps[], isSettings = false) {
  const g = { details: [] as FieldProps[], content: [] as FieldProps[], media: [] as FieldProps[], publish: [] as FieldProps[], seo: [] as FieldProps[] };
  for (const f of fields) {
    if (f.name.startsWith('seo') && !isSettings) g.seo.push(f);
    else if (f.type === 'image') g.media.push(f);
    else if (f.type === 'boolean' || f.name === 'sort' || f.type === 'date') g.publish.push(f);
    else if (f.type === 'markdown') g.content.push(f);
    else g.details.push(f);
  }
  return g;
}

export function AdminForm({ action, fields, hidden, submitLabel = 'Save', savedNotice, layout = 'split' }: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  fields: FieldProps[];
  hidden: Record<string, string>;
  submitLabel?: string;
  savedNotice?: string;
  layout?: 'split' | 'single';
}) {
  const [state, formAction, pending] = useActionState(action, savedNotice ? { ok: savedNotice } : undefined);
  const [dirty, setDirty] = useState(false);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (state?.ok) { setDirty(false); setFlash(true); const t = setTimeout(() => setFlash(false), 3500); return () => clearTimeout(t); }
  }, [state]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const g = groupFields(fields, '__group' in hidden);
  const grid = (list: FieldProps[]) => <div className="a-fields">{list.map((f) => <Field key={f.name} {...f} />)}</div>;
  const saveBtn = (
    <button className="a-btn primary" type="submit" disabled={pending}>
      <Icon name={pending ? 'clock' : 'check'} size={16} />{pending ? 'Saving…' : submitLabel}
    </button>
  );

  const main = (
    <>
      {g.details.length > 0 && <Card title="Details" icon="pen">{grid(g.details)}</Card>}
      {g.content.length > 0 && <Card title="Content" icon="notebook">{grid(g.content)}</Card>}
      {layout === 'single' && g.media.length > 0 && <Card title="Images" icon="sparkles">{grid(g.media)}</Card>}
      {layout === 'single' && g.publish.length > 0 && <Card title="Options" icon="layers">{grid(g.publish)}</Card>}
      {g.seo.length > 0 && <Card title="Search engine (SEO)" icon="search" collapsible defaultOpen={layout === 'single'}>{grid(g.seo)}</Card>}
    </>
  );

  return (
    <form onSubmit={keepValues(formAction)} onChange={() => setDirty(true)} className={`a-form a-form-${layout}`}>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state?.error && <p className="a-msg err" role="alert"><Icon name="info" size={18} />{state.error}</p>}
      {layout === 'split' ? (
        <div className="a-split">
          <div className="a-split-main">{main}</div>
          <aside className="a-split-side">
            <Card title="Publish" icon="rocket">
              {g.publish.length > 0 ? grid(g.publish) : <p className="a-help">Save to apply your changes on the website.</p>}
              <div className="a-side-save">{saveBtn}</div>
            </Card>
            {g.media.length > 0 && <Card title={g.media.length > 1 ? 'Images' : 'Image'} icon="sparkles">{grid(g.media)}</Card>}
          </aside>
        </div>
      ) : main}
      <div className={`a-savebar${dirty ? ' dirty' : ''}${flash ? ' saved' : ''}`}>
        <span className="a-savebar-status">
          {flash ? <><Icon name="checkCircle" size={18} />{state?.ok ?? 'Saved'}</> : dirty ? <><span className="a-dot" />Unsaved changes</> : <><Icon name="checkCircle" size={18} />All changes saved</>}
        </span>
        {saveBtn}
      </div>
    </form>
  );
}

export function SimpleForm({ action, children, submitLabel }: {
  action: (s: FormState, fd: FormData) => Promise<FormState>; children: React.ReactNode; submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form onSubmit={keepValues(formAction)} className="a-form">
      {state?.error && <p className="a-msg err" role="alert"><Icon name="info" size={18} />{state.error}</p>}
      {state?.ok && <p className="a-msg ok" role="status"><Icon name="checkCircle" size={18} />{state.ok}</p>}
      <div className="a-fields">{children}</div>
      <div><button className="a-btn primary" type="submit" disabled={pending}><Icon name="check" size={16} />{pending ? 'Please wait…' : submitLabel}</button></div>
    </form>
  );
}

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button type="submit" className={className ?? 'a-btn danger'} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
