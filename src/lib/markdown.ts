import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: true });

/** Renders admin-authored Markdown to safe HTML. */
export function renderMarkdown(md: string | null | undefined): string {
  const html = marked.parse(md ?? '', { async: false }) as string;
  return sanitizeHtml(html, {
    // links typed as "www.edexo.in/…" (no https://) would otherwise resolve relative to the page → /blog/www.edexo.in (404)
    transformTags: {
      a: (tagName, attribs) => {
        const href = (attribs.href || '').trim();
        if (!href) return { tagName, attribs };
        let fixed = /^www\./i.test(href) || /^[a-z0-9-]+\.(in|com|org|net)(\/|$)/i.test(href) ? `https://${href}` : href;
        // own-site absolute links → root-relative, so http/non-www copies never leak into internal links
        if (/^https?:\/\/(www\.)?edexo\.in(\/|$)/i.test(fixed)) fixed = fixed.replace(/^https?:\/\/(www\.)?edexo\.in/i, '') || '/';
        if (!/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(fixed)) fixed = '/' + fixed.replace(/^\.?\//, '');
        return { tagName, attribs: { ...attribs, href: fixed } };
      },
    },
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.google.com', 'maps.google.com'],
  });
}
