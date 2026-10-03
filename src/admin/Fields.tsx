'use client';
import { startTransition, useActionState, useState } from 'react';
import type { FieldDef } from '@/lib/settings';
import type { FormState } from './actions';

export interface FieldProps extends FieldDef { value: unknown; resolvedOptions?: { value: string; label: string }[] }

function ImageField({ name, label, value, help }: FieldProps) {
  const id = Number(value) || null;
  const [preview, setPreview] = useState<string | null>(id ? `/media/${id}` : null);
  const [removed, setRemoved] = useState(false);
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image">
        <div className="a-thumb">{preview && !removed ? <img src={preview} alt="" /> : <span>No image</span>}</div>
        <div className="a-image-controls">
          <input type="hidden" name={name} value={id ?? ''} />
          <input type="file" name={`${name}__file`} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            aria-label={`Upload ${label}`}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); setRemoved(false); } }} />
          {id && (
            <label className="a-check"><input type="checkbox" name={`${name}__remove`} onChange={(e) => setRemoved(e.target.checked)} /> Remove image</label>
          )}
          <small>PNG, JPG or WEBP up to 8 MB. Large images are resized automatically.</small>
        </div>
      </div>
      {help && <small className="a-help">{help}</small>}
    </div>
  );
}

function toDateInput(v: unknown) {
  if (!v) return '';
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export function Field(p: FieldProps) {
  const { name, label, type, help, required, placeholder, value } = p;
  if (type === 'image') return <ImageField {...p} />;
  if (type === 'boolean') {
    return (
      <div className="a-field">
        <label className="a-check a-switch"><input type="checkbox" name={name} defaultChecked={value === undefined ? true : value === true || value === 'true'} /> {label}</label>
        {help && <small className="a-help">{help}</small>}
      </div>
    );
  }
  const str = value === null || value === undefined ? '' : String(value);
  let input: React.ReactNode;
  switch (type) {
    case 'textarea':
      input = <textarea id={`f-${name}`} name={name} defaultValue={str} required={required} placeholder={placeholder} rows={3} />;
      break;
    case 'lines':
      input = <textarea id={`f-${name}`} name={name} defaultValue={str} required={required} placeholder={placeholder ?? 'One item per line'} rows={4} />;
      break;
    case 'markdown':
      input = (
        <>
          <textarea id={`f-${name}`} name={name} defaultValue={str} required={required} rows={14} className="a-md" />
          <small className="a-help">Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- list item</code>, <code>[link text](https://…)</code>, <code>![image](url)</code></small>
        </>
      );
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
      input = <input id={`f-${name}`} name={name} type={type === 'url' ? 'url' : 'text'} defaultValue={str} required={required} placeholder={placeholder} />;
  }
  return (
    <div className="a-field">
      <label className="a-label" htmlFor={`f-${name}`}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {input}
      {help && type !== 'markdown' && <small className="a-help">{help}</small>}
    </div>
  );
}

/** Submit without React's automatic form reset, so typed values survive a validation error. */
export function keepValues(formAction: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
}

export function AdminForm({ action, fields, hidden, submitLabel = 'Save', savedNotice }: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  fields: FieldProps[];
  hidden: Record<string, string>;
  submitLabel?: string;
  savedNotice?: string;
}) {
  const [state, formAction, pending] = useActionState(action, savedNotice ? { ok: savedNotice } : undefined);
  return (
    <form onSubmit={keepValues(formAction)} className="a-form">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state?.error && <p className="a-msg err" role="alert">{state.error}</p>}
      {state?.ok && <p className="a-msg ok" role="status">{state.ok}</p>}
      <div className="a-fields">{fields.map((f) => <Field key={f.name} {...f} />)}</div>
      <div className="a-actions">
        <button className="a-btn primary" type="submit" disabled={pending}>{pending ? 'Saving…' : submitLabel}</button>
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
      {state?.error && <p className="a-msg err" role="alert">{state.error}</p>}
      {state?.ok && <p className="a-msg ok" role="status">{state.ok}</p>}
      <div className="a-fields">{children}</div>
      <div className="a-actions"><button className="a-btn primary" type="submit" disabled={pending}>{pending ? 'Please wait…' : submitLabel}</button></div>
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
