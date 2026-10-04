import Script from 'next/script';
import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/Icon';
import { Effects } from '@/components/site/Effects';
import { CookieNotice } from '@/components/site/CookieNotice';
import { getSettings, s, on } from '@/lib/settings';
import { waHref } from '@/lib/format';

const ok = (v: string, re: RegExp) => (re.test(v) ? v : '');

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const st = await getSettings();
  const gtm = ok(s(st, 'gtmId').trim(), /^GTM-[A-Z0-9]+$/);
  const ga4 = ok(s(st, 'ga4Id').trim(), /^G-[A-Z0-9]+$/);
  const ads = ok(s(st, 'googleAdsId').trim(), /^AW-\d+$/);
  const adsLabel = ok(s(st, 'googleAdsLabel').trim(), /^[\w-]+$/);
  const pixel = ok(s(st, 'metaPixelId').trim(), /^\d{6,20}$/);
  const gtagId = ga4 || ads;
  const wa = waHref(s(st, 'whatsapp'), 'Hi Edexo, I would like to know about your language courses.');
  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${ga4 ? `gtag('config','${ga4}');` : ''}${ads ? `gtag('config','${ads}');` : ''}${ads && adsLabel ? `window.__edexoAds='${ads}/${adsLabel}';` : ''}`}</Script>
        </>
      )}
      {pixel && (
        <Script id="fbq" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>
      )}
      <Link href="#main" className="skip-link">Skip to content</Link>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Effects />
      {wa && on(st, 'showWhatsappButton') && (
        <a className="wa-float" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <Icon name="whatsapp" size={28} />
        </a>
      )}
      {st.cookieNotice === true && <CookieNotice />}
    </>
  );
}
