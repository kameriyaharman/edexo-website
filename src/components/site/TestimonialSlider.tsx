'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

export interface T { id: number; name: string; role: string | null; quote: string; rating: number; photo: string | null }

export function TestimonialSlider({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  const n = items.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n]);
  if (!n) return null;
  const t = items[i];
  return (
    <div className="testimonial" aria-roledescription="carousel" aria-label="Student reviews">
      {t.photo ? <img src={t.photo} alt="" /> : <span className="avatar" />}
      <div className="body" aria-live="polite">
        <blockquote>“{t.quote}”</blockquote>
        <div className="stars" aria-label={`${t.rating} out of 5 stars`}>
          {Array.from({ length: Math.max(0, Math.min(5, t.rating)) }).map((_, k) => <Icon key={k} name="star" size={18} color="#E39B12" />)}
        </div>
        <div className="t-name">{t.name}</div>
        {t.role && <div className="t-role">{t.role}</div>}
      </div>
      {n > 1 && (
        <div className="slider-btns">
          <button type="button" className="round-btn" aria-label="Previous review" onClick={() => setI((i - 1 + n) % n)}><Icon name="chevronLeft" size={18} /></button>
          <button type="button" className="round-btn primary" aria-label="Next review" onClick={() => setI((i + 1) % n)}><Icon name="chevronRight" size={18} /></button>
        </div>
      )}
    </div>
  );
}
