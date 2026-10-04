'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

const REVEAL = [
  '.section-head', '.split-head', '.feature', '.course-card', '.reason', '.level', '.post-card', '.branch',
  '.stat', '.testimonial', '.enquiry-copy', '.enquiry-form', '.about-visual', '.about-copy', '.page-hero .wrap',
  '.prose', '.contact-grid > *', '.course-aside', '.course-cover', '.tabs',
  '.program-card', '.why-item', '.rung', '.exam-group', '.format-card', '.abroad-card', '.faq', '.hl-item', '.level-card',
  '.fee-card', '.contact-opt', '.steps', '.fee-table-wrap', '.c-block',
  '.pw-card', '.pw-steps li', '.pw-intake', '.pw-col', '.pw-note', '.pw-package', '.pw-path-step', '.pw-ticks li',
].join(',');

/** Scroll-reveal, count-up numbers, header shadow and the custom cursor for the public site. */
export function Effects() {
  const path = usePathname();

  // click tracking: WhatsApp, phone, email and marked CTA buttons
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a, button') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const label = (a.textContent ?? '').trim().slice(0, 60);
      const where = window.location.pathname;
      if (/wa\.me|whatsapp\.com/.test(href)) track('whatsapp_click', { link_text: label, page: where });
      else if (href.startsWith('tel:')) track('phone_click', { phone: href.slice(4), page: where });
      else if (href.startsWith('mailto:')) track('email_click', { page: where });
      if (a.dataset.cta) track('cta_click', { cta: a.dataset.cta, link_text: label, page: where });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  // scroll reveal + count-up (re-run on every page)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = new WeakSet<Element>();

    const countUp = (el: HTMLElement) => {
      const m = (el.textContent ?? '').trim().match(/^(\d[\d,]*)(.*)$/);
      if (!m || reduce) return;
      const target = Number(m[1].replace(/,/g, ''));
      const suffix = m[2];
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('in');
        el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
        io.unobserve(el);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const scan = () => {
      document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) return; // already on screen: never hide it
        const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(REVEAL)) : [];
        el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * 90}ms`);
        el.classList.add('reveal');
        io.observe(el);
      });
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const host = el.closest('.reveal');
        if (!host) countUp(el);
      });
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);

  // header shadow when scrolled
  useEffect(() => {
    const header = document.querySelector('.header');
    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // custom cursor: dot + trailing ring (mouse / trackpad only)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(ring, dot);
    document.documentElement.classList.add('has-cursor');

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const interactive = 'a, button, [role="tab"], select, label, summary, .course-card, .post-card';
    const onMove = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      document.documentElement.classList.remove('cursor-hidden');
      const t = e.target as Element | null;
      const hot = !!t?.closest?.(interactive);
      const text = !!t?.closest?.('input, textarea');
      ring.classList.toggle('hover', hot && !text);
      dot.classList.toggle('hover', hot && !text);
      document.documentElement.classList.toggle('cursor-text', text);
    };
    const onDown = () => ring.classList.add('down');
    const onUp = () => ring.classList.remove('down');
    const onLeave = () => document.documentElement.classList.add('cursor-hidden');
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      dot.remove(); ring.remove();
      document.documentElement.classList.remove('has-cursor', 'cursor-text', 'cursor-hidden');
    };
  }, []);

  return null;
}
