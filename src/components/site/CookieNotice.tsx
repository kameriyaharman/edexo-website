'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Small dismissible notice. Remembers the choice in a first-party cookie. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!document.cookie.includes('edexo_cookie_ok=1')); }, []);
  if (!show) return null;
  const accept = () => { document.cookie = 'edexo_cookie_ok=1; max-age=31536000; path=/; samesite=lax'; setShow(false); };
  return (
    <div className="cookie-bar" role="region" aria-label="Cookie notice">
      <p>We use cookies to understand website usage and measure our ads. See our <Link href="/cookie-policy">Cookie Policy</Link>.</p>
      <button type="button" className="btn btn-orange btn-sm" onClick={accept}>OK</button>
    </div>
  );
}
