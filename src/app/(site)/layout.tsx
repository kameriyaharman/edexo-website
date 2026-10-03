import Script from 'next/script';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/Icon';
import { Effects } from '@/components/site/Effects';
import { getSettings, s, on } from '@/lib/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const st = await getSettings();
  const gtm = s(st, 'gtmId').trim();
  const wa = s(st, 'whatsapp').replace(/\D/g, '');
  return (
    <>
      {gtm && /^GTM-[A-Z0-9]+$/.test(gtm) && (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Effects />
      {wa && on(st, 'showWhatsappButton') && (
        <a className="wa-float" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <Icon name="whatsapp" size={28} />
        </a>
      )}
    </>
  );
}
