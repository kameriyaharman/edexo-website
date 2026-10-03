import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section bg-peach">
      <div className="wrap center" style={{ maxWidth: 640 }}>
        <span className="eyebrow">404</span>
        <h1 className="h2" style={{ marginBottom: 16 }}>We couldn&apos;t find that page</h1>
        <p style={{ marginBottom: 28 }}>It may have moved. Try our courses or go back to the home page.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-orange" href="/courses">View Courses</Link>
          <Link className="btn btn-navy" href="/">Home</Link>
        </div>
      </div>
    </section>
  );
}
