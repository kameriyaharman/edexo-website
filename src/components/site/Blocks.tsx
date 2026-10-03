import Link from 'next/link';
import { formatDate, mediaUrl, splitLines, telHref } from '@/lib/format';
import { Icon } from '@/components/Icon';

export function PostCard({ p }: { p: { slug: string; title: string; excerpt: string | null; coverId: number | null; publishedAt: Date | null } }) {
  const img = mediaUrl(p.coverId);
  return (
    <Link href={`/blog/${p.slug}`} className="post-card">
      {img ? <img src={img} alt="" loading="lazy" /> : <div className="noimg" />}
      <div className="date"><Icon name="calendar" size={14} />{formatDate(p.publishedAt)}</div>
      <h3>{p.title}</h3>
      {p.excerpt && <p>{p.excerpt}</p>}
      <span className="link-arrow">Read More <Icon name="arrowRight" size={16} /></span>
    </Link>
  );
}

export function BranchCard({ b }: { b: { name: string; address: string; landmark: string | null; phones: string | null; email: string | null; mapUrl: string | null } }) {
  return (
    <div className="card branch">
      <div className="branch-head"><span className="branch-ic"><Icon name="building" size={22} /></span><h3>{b.name}</h3></div>
      <p className="b-row"><Icon name="pin" size={17} /><span>{b.address}</span></p>
      {b.landmark && <p className="b-row lm"><Icon name="navigation" size={16} /><span>{b.landmark}</span></p>}
      <div className="phones">
        {splitLines(b.phones).map((ph) => <a key={ph} href={telHref(ph)}><Icon name="phone" size={15} />{ph}</a>)}
      </div>
      {b.email && <p className="b-row" style={{ marginTop: 10 }}><Icon name="mail" size={16} /><a href={`mailto:${b.email}`}>{b.email}</a></p>}
      <p style={{ marginTop: 16 }}><a className="link-arrow" href={b.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Edexo ' + b.address)}`} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={16} />Get directions</a></p>
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
              <span key={i} className="crumb">
                {i === 0 && <Icon name="home" size={14} />}
                {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
                {i < crumbs.length - 1 && <Icon name="chevronRight" size={14} />}
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
