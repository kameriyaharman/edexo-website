import { getCourses, getFeatures } from '@/lib/data';
import { Icon, iconFor } from '@/components/Icon';

/** Moving strip under the hero: course names and highlights, scrolling endlessly. */
export async function Ticker() {
  const [courses, features] = await Promise.all([getCourses(), getFeatures()]);
  const items = [...courses.map((c) => c.title), ...features.map((f) => f.title), 'Free Demo Class'];
  if (!items.length) return null;
  const row = (hidden: boolean) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="ticker-item"><Icon name={iconFor(t)} size={18} />{t}<span className="ticker-star" aria-hidden="true">✦</span></span>
      ))}
    </div>
  );
  return (
    <div className="ticker" aria-label="Courses and highlights">
      <div className="ticker-track">{row(false)}{row(true)}</div>
    </div>
  );
}
