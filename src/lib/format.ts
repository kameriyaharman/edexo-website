export function mediaUrl(id: number | null | undefined): string | null {
  return id ? `/media/${id}` : null;
}

export function inr(n: number | null | undefined): string {
  if (n === null || n === undefined) return '';
  return '₹' + n.toLocaleString('en-IN');
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function splitLines(v: string | null | undefined): string[] {
  return (v ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
}

export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function waHref(number: string | null | undefined, text?: string): string {
  const n = (number ?? '').replace(/\D/g, '');
  if (!n) return '';
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Public lead reference shown to admins and in CSV exports, e.g. EDX-000123. */
export function leadId(id: number): string {
  return `EDX-${String(id).padStart(6, '0')}`;
}
