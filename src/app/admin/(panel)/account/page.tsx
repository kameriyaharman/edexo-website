import { asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireAdmin } from '@/lib/auth';
import { addAdmin, changePassword, removeAdmin } from '@/admin/actions';
import { ConfirmButton, SimpleForm } from '@/admin/Fields';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Account & admins' };

function Input({ name, label, type = 'text', auto }: { name: string; label: string; type?: string; auto?: string }) {
  return (
    <div className="a-field">
      <label className="a-label" htmlFor={`acc-${name}`}>{label}</label>
      <input className="a-input" style={{ background: 'var(--a-soft)' }} id={`acc-${name}`} name={name} type={type} required={name !== 'name'} autoComplete={auto} />
    </div>
  );
}

export default async function Account() {
  const me = await requireAdmin();
  const admins = await db.select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
    .from(schema.adminUsers).orderBy(asc(schema.adminUsers.id));
  return (
    <>
      <div className="a-top"><div><h1><span className="a-title-ic"><Icon name="shield" size={22} /></span>Account & admins</h1><p>Signed in as {me.email}</p></div></div>
      <div className="a-card">
        <h2><Icon name="shield" size={18} />Change your password</h2><p className="sub">Use at least 10 characters.</p>
        <SimpleForm action={changePassword} submitLabel="Change password">
          <Input name="current" label="Current password" type="password" auto="current-password" />
          <Input name="next" label="New password" type="password" auto="new-password" />
        </SimpleForm>
      </div>
      <div className="a-card">
        <h2><Icon name="users" size={18} />Admins</h2><p className="sub">Everyone here can sign in and edit the whole website.</p>
        <div className="a-table-wrap" style={{ marginBottom: 20 }}>
          <table className="a-table">
            <thead><tr><th>Email</th><th>Name</th><th /></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="title">{a.email}</td><td>{a.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    {a.id !== me.id && (
                      <form action={removeAdmin}><input type="hidden" name="id" value={a.id} />
                        <ConfirmButton className="a-btn sm danger" message={`Remove ${a.email}?`}>Remove</ConfirmButton></form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 style={{ fontSize: 16 }}>Add an admin</h2>
        <SimpleForm action={addAdmin} submitLabel="Add admin">
          <Input name="email" label="Email" type="email" auto="off" />
          <Input name="name" label="Name (optional)" />
          <Input name="password" label="Temporary password" type="password" auto="new-password" />
        </SimpleForm>
      </div>
    </>
  );
}
