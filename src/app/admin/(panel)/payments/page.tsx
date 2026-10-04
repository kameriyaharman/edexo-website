import Link from 'next/link';
import { count, desc, eq, sum } from 'drizzle-orm';
import { db, schema } from '@/db';
import { Icon } from '@/components/Icon';
import { inr, leadId } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { razorpayConfig } from '@/lib/payments';

export const metadata = { title: 'Payments' };

export default async function Payments({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = ['paid', 'created'].includes(sp.status ?? '') ? sp.status! : '';
  const p = schema.payments;
  const [rows, totals, st] = await Promise.all([
    db.select().from(p).where(status ? eq(p.status, status) : undefined).orderBy(desc(p.createdAt)).limit(200),
    db.select({ n: count(), amt: sum(p.amount) }).from(p).where(eq(p.status, 'paid')),
    getSettings(),
  ]);
  const cfg = razorpayConfig(st);
  return (
    <>
      <div className="a-top">
        <div><h1><span className="a-title-ic"><Icon name="wallet" size={22} /></span>Payments</h1><p>Course fees paid online from the Thank-you page (Razorpay).</p></div>
        <div className="a-top-actions"><Link className="a-btn" href="/admin/settings/payments"><Icon name="shield" size={15} />Razorpay settings</Link></div>
      </div>
      {!cfg.enabled && (
        <p className="a-msg err" style={{ marginBottom: 16 }}><Icon name="info" size={18} />
          Online payment is OFF. Add your Razorpay Key ID + Key Secret and switch on “Show Pay Now” in <Link href="/admin/settings/payments">Payments settings</Link>.
        </p>
      )}
      {cfg.enabled && cfg.test && <p className="a-msg" style={{ marginBottom: 16, background: '#FFF0D6', color: '#8A5300' }}><Icon name="info" size={18} />Test mode keys are active — no real money is collected.</p>}
      <div className="a-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 18 }}>
        <div className="a-stat"><span className="a-stat-ic" style={{ background: 'linear-gradient(135deg,#34D399,#059669)' }}><Icon name="wallet" size={22} /></span>
          <div><strong>{inr(Number(totals[0]?.amt ?? 0) / 100)}</strong><span>Collected</span></div></div>
        <div className="a-stat"><span className="a-stat-ic" style={{ background: 'linear-gradient(135deg,#3B5BDB,#1A2E8C)' }}><Icon name="checkCircle" size={22} /></span>
          <div><strong>{Number(totals[0]?.n ?? 0)}</strong><span>Paid payments</span></div></div>
      </div>
      <div className="a-tabs">
        {[['', 'All'], ['paid', 'Paid'], ['created', 'Started / not completed']].map(([v, l]) => (
          <Link key={v} href={v ? `/admin/payments?status=${v}` : '/admin/payments'} aria-current={status === v ? 'page' : undefined}>{l}</Link>
        ))}
      </div>
      {rows.length ? (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Date</th><th>Student</th><th>Course</th><th>Amount</th><th>Status</th><th>Razorpay</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>{r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="title">{r.name}<div className="muted">{r.phone}{r.enquiryId ? <> · <Link href={`/admin/enquiries?q=${leadId(r.enquiryId)}`}>{leadId(r.enquiryId)}</Link></> : null}</div></td>
                  <td>{r.courseTitle}{r.mode ? <div className="muted">{r.mode}</div> : null}</td>
                  <td style={{ fontWeight: 700 }}>{inr(r.amount / 100)}</td>
                  <td>
                    <span className={`pill-s ${r.status === 'paid' ? 'st-converted' : 'off'}`}>{r.status === 'paid' ? 'Paid' : 'Not completed'}</span>
                    {r.error && r.status !== 'paid' && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{r.error}</div>}
                  </td>
                  <td className="muted" style={{ fontSize: 12.5 }}>{r.paymentId ?? '—'}<div>{r.orderId}</div>{r.method && <div>{r.method}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="a-card a-empty"><span className="a-empty-ic"><Icon name="wallet" size={26} /></span>No payments yet.</div>}
    </>
  );
}
