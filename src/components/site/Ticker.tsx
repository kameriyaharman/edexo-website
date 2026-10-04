import { getFeatures, getLanguages } from '@/lib/data';
import { Icon, iconFor } from '@/components/Icon';

/** Moving strip under the hero: languages and highlights, scrolling endlessly. */
export async function Ticker() {
  const [langs, features] = await Promise.all([getLanguages(), getFeatures()]);
  const items = [...langs.filter((l) => l.category !== 'kids').map((l) => l.name), ...features.map((f) => f.title), 'Free Demo Class'];
  if (!items.length) return null;
  const row = (hidden: boolean) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="ticker-item"><Icon name={iconFor(t)} size={18} />{t}<span className="ticker-star" aria-hidden="true">✦</span></span>
      ))}
    </div>
  );
  return (
    <div className="ticker" aria-label="Languages and highlights">
      <div className="ticker-track">{row(false)}{row(true)}</div>
    </div>
  );
}
