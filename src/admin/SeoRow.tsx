'use client';

import { useActionState, useState } from 'react';
import { saveSeo, type SeoState } from './seo-actions';

export type SeoRowData = {
  key: string; url: string; label: string; group: string; live: boolean;
  title: string; description: string; autoTitle: string; autoDescription: string;
  hidden: Record<string, string>; editHref?: string; noSuffix?: boolean;
};

const SUFFIX = ' | Edexo';

function Count({ n, ok, max }: { n: number; ok: [number, number]; max: number }) {
  const cls = n === 0 ? 'muted' : n < ok[0] ? 'warn' : n > max ? 'bad' : n > ok[1] ? 'warn' : 'good';
  return <span className={`seo-count ${cls}`}>{n}/{max}</span>;
}

export function SeoRow({ row, site }: { row: SeoRowData; site: string }) {
  const [state, action, pending] = useActionState<SeoState, FormData>(saveSeo, undefined);
  const [title, setTitle] = useState(row.title);
  const [desc, setDesc] = useState(row.description);
  const shownTitle = title.trim() || row.autoTitle;
  const fullTitle = row.noSuffix || /edexo/i.test(shownTitle) ? shownTitle : shownTitle + SUFFIX;
  const shownDesc = desc.trim() || row.autoDescription;
  const dirty = title !== row.title || desc !== row.description;

  return (
    <form action={action} className="seo-row" id={row.key}>
      {Object.entries(row.hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="seo-head">
        <div>
          <strong>{row.label}</strong>
          <a className="seo-url" href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a>
        </div>
        <div className="seo-pills">
          {!row.live && <span className="pill-s off" title="Not published — Google does not see this page">Hidden</span>}
          <span className={`pill-s ${row.title || row.description ? 'on' : ''}`}>{row.title || row.description ? 'Custom' : 'Automatic'}</span>
        </div>
      </div>
      <div className="seo-grid">
        <label className="seo-field">
          <span>Google title <Count n={fullTitle.length} ok={[30, 60]} max={65} /></span>
          <input className="a-input" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={row.autoTitle} maxLength={120} />
        </label>
        <label className="seo-field">
          <span>Google description <Count n={shownDesc.length} ok={[70, 160]} max={165} /></span>
          <textarea className="a-input" name="description" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={row.autoDescription} maxLength={320} />
        </label>
      </div>
      <div className="seo-foot">
        <div className="seo-preview" aria-label="Google preview">
          <span className="seo-p-url">{site.replace(/^https?:\/\//, '')}{row.url === '/' ? '' : row.url.replace(/\//g, ' › ').replace(/^ › /, ' › ')}</span>
          <span className="seo-p-title">{fullTitle.length > 65 ? fullTitle.slice(0, 62) + '…' : fullTitle}</span>
          <span className="seo-p-desc">{shownDesc.length > 165 ? shownDesc.slice(0, 160) + '…' : shownDesc}</span>
        </div>
        <div className="seo-actions">
          {state?.ok && !dirty && <span className="seo-msg ok">✓ {state.ok}</span>}
          {state?.error && <span className="seo-msg bad">{state.error}</span>}
          {row.editHref && <a className="a-btn sm" href={row.editHref}>Full edit</a>}
          <button className="a-btn sm primary" type="submit" disabled={pending || !dirty}>{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </form>
  );
}
