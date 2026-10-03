'use client';
import { useState } from 'react';
import { CourseCard, type CourseCardData } from './CourseCard';

export function CourseTabs({ languages, courses, initial }: {
  languages: { slug: string; name: string }[];
  courses: (CourseCardData & { languageSlug: string | null })[];
  initial?: string;
}) {
  const tabs = languages.filter((l) => courses.some((c) => c.languageSlug === l.slug));
  const [active, setActive] = useState(initial && tabs.some((t) => t.slug === initial) ? initial : tabs[0]?.slug ?? '');
  const shown = courses.filter((c) => c.languageSlug === active);

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActive(tabs[next].slug);
    (document.getElementById(`tab-${tabs[next].slug}`) as HTMLButtonElement | null)?.focus();
  }

  if (!tabs.length) return <p className="empty">Courses will be listed here soon.</p>;
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Languages">
        {tabs.map((t, i) => (
          <button key={t.slug} id={`tab-${t.slug}`} role="tab" type="button" className="tab"
            aria-selected={t.slug === active} aria-controls="course-panel" tabIndex={t.slug === active ? 0 : -1}
            onClick={() => setActive(t.slug)} onKeyDown={(e) => onKey(e, i)}>
            {t.name}
          </button>
        ))}
      </div>
      <div id="course-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="course-grid">
        {shown.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>
    </>
  );
}
