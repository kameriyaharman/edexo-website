'use client';
/* Conversion tracking helpers. Each call is safe when a tag is not configured. */
type W = Window & {
  dataLayer?: unknown[];
  gtag?: (...a: unknown[]) => void;
  fbq?: (...a: unknown[]) => void;
  __edexoAds?: string;
};

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as W;
  try {
    (w.dataLayer = w.dataLayer || []).push({ event, ...params });
    w.gtag?.('event', event, params);
  } catch { /* ignore */ }
}

/** A form was submitted successfully: GA4 generate_lead + Meta Lead + Google Ads conversion. */
export function trackLead(type: string, params: Record<string, unknown> = {}) {
  const w = window as W;
  track('generate_lead', { lead_type: type, ...params });
  try {
    w.fbq?.('track', type === 'career' ? 'SubmitApplication' : 'Lead', { content_category: type, ...params });
    if (w.__edexoAds && type !== 'career') w.gtag?.('event', 'conversion', { send_to: w.__edexoAds });
  } catch { /* ignore */ }
}
