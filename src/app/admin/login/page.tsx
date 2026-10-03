import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { getSettings, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';
import { LoginForm } from './LoginForm';
import '../admin.css';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  const logo = mediaUrl(imageId(await getSettings(), 'logoId'));
  return (
    <div className="admin a-login">
      <div className="a-card">
        {logo && <img src={logo} alt="Edexo" style={{ height: 40, margin: '0 auto 20px' }} />}
        <h1 style={{ fontSize: 22, textAlign: 'center', marginBottom: 6 }}>Admin panel</h1>
        <p style={{ textAlign: 'center', color: '#6B7189', marginBottom: 24 }}>Sign in to manage the website.</p>
        <LoginForm />
      </div>
    </div>
  );
}
