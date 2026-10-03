import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: true });

/** Renders admin-authored Markdown to safe HTML. */
export function renderMarkdown(md: string | null | undefined): string {
  const html = marked.parse(md ?? '', { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.google.com', 'maps.google.com'],
  });
}
