import Link from 'next/link';
import { formatDate, mediaUrl, splitLines, telHref } from '@/lib/format';

export function PostCard({ p }: { p: { slug: string; title: string; excerpt: string | null; coverId: number | null; publishedAt: Date | null } }) {
  const img = mediaUrl(p.coverId);
  return (
    <Link href={`/blog/${p.slug}`} className="post-card">
      {img ? <img src={img} alt="" loading="lazy" /> : <div className="noimg" />}
      <div className="date">{formatDate(p.publishedAt)}</div>
      <h3>{p.title}</h3>
      {p.excerpt && <p>{p.excerpt}</p>}
      <span className="link-arrow">Read More →</span>
    </Link>
  );
}

export function BranchCard({ b }: { b: { name: string; address: string; landmark: string | null; phones: string | null; email: string | null; mapUrl: string | null } }) {
  return (
    <div className="card branch">
      <h3>{b.name}</h3>
      <p>{b.address}</p>
      {b.landmark && <p className="lm">{b.landmark}</p>}
      <div className="phones">
        {splitLines(b.phones).map((ph) => <a key={ph} href={telHref(ph)}>{ph}</a>)}
      </div>
      {b.email && <p style={{ marginTop: 10 }}><a href={`mailto:${b.email}`}>{b.email}</a></p>}
      {b.mapUrl && <p style={{ marginTop: 14 }}><a className="link-arrow" href={b.mapUrl} target="_blank" rel="noopener noreferrer">Get directions →</a></p>}
    </div>
  );
}

export function PageHero({ title, subtitle, crumbs }: { title: string; subtitle?: string | null; crumbs?: { label: string; href?: string }[] }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}{i < crumbs.length - 1 ? ' /' : ''}</span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
