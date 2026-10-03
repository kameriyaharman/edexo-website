import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { inr, mediaUrl } from '@/lib/format';

export interface CourseCardData {
  id: number; title: string; slug: string; price: number | null; mrp: number | null;
  duration: string | null; mode: string | null; shortDesc: string | null; imageId: number | null;
  languageCode: string | null;
}

export function CourseCard({ c }: { c: CourseCardData }) {
  const img = mediaUrl(c.imageId);
  const href = `/courses/${c.slug}`;
  return (
    <article className="card course-card">
      <div className="course-media">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          {img ? <img src={img} alt={`${c.title} course at Edexo`} loading="lazy" /> : <div className="noimg" />}
        </Link>
        {c.languageCode && <span className="lang-badge">{c.languageCode}</span>}
      </div>
      {c.price !== null && (
        <div className="price"><span className="price-ic"><Icon name="wallet" size={16} /></span>
          <strong>{inr(c.price)}</strong>
          {c.mrp && c.mrp > c.price ? <s aria-label={`Original price ${inr(c.mrp)}`}>{inr(c.mrp)}</s> : null}
        </div>
      )}
      <h3><Link href={href}>{c.title}</Link></h3>
      {c.shortDesc && <p>{c.shortDesc}</p>}
      <div className="meta">
        {c.duration && <span><Icon name="clock" size={16} />{c.duration}</span>}
        {c.mode && <span><Icon name="laptop" size={16} />{c.mode}</span>}
      </div>
      <div className="card-foot">
        <Link className="details" href={href}>View details <Icon name="arrowRight" size={15} /></Link>
        <Link className="btn btn-orange btn-sm" href={`${href}#enroll`}><Icon name="cap" size={16} />Enroll Now</Link>
      </div>
    </article>
  );
}
