import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { getSettings, imageId } from '@/lib/settings';
import { mediaUrl } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { LoginForm } from './LoginForm';
import '../admin.css';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  const st = await getSettings();
  const logo = mediaUrl(imageId(st, 'logoId'));
  const logoWhite = mediaUrl(imageId(st, 'logoWhiteId'));
  return (
    <div className="admin a-login">
      <div className="a-login-art">
        {logoWhite ? <img src={logoWhite} alt="Edexo" style={{ height: 40, width: 'auto', alignSelf: 'flex-start' }} /> : <strong>Edexo</strong>}
        <div>
          <h2>Manage your whole website from one place.</h2>
          <p>Courses, prices, blog, testimonials, centres and every enquiry — all editable here.</p>
          <ul>
            <li><span><Icon name="cap" size={18} /></span>Update courses and prices in seconds</li>
            <li><span><Icon name="contact" size={18} /></span>See every free-demo enquiry</li>
            <li><span><Icon name="sparkles" size={18} /></span>Change photos, text and sections</li>
          </ul>
        </div>
        <small style={{ color: '#8C95BE' }}>Edexo admin panel</small>
      </div>
      <div className="a-login-form">
        <div className="a-login-card">
          {logo && <img src={logo} alt="Edexo" style={{ height: 36, width: 'auto', marginBottom: 22, display: 'block' }} />}
          <h1>Welcome back</h1>
          <p className="lead">Sign in to manage the website.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
