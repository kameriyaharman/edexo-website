const paths: Record<string, React.ReactNode> = {
  laptop: (<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></>),
  book: (<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />),
  award: (<><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 22l5-3 5 3-1.5-8" /></>),
  pin: (<><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  cap: (<><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></>),
  plane: (<path d="M2 16l20-8-6 12-3-5z" />),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.5 2.4 3.5 5.2" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: (<path d="M5 12l5 5L20 7" />),
  arrowRight: (<path d="M5 12h14M13 6l6 6-6 6" />),
  chevronLeft: (<path d="M15 6l-6 6 6 6" />),
  chevronRight: (<path d="M9 6l6 6-6 6" />),
  phone: (<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  close: (<path d="M6 6l12 12M18 6L6 18" />),
  star: (<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  chat: (<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />),
};

export const iconNames = Object.keys(paths);

export function Icon({ name, size = 20, stroke = 2, className, color = 'currentColor' }: {
  name: string; size?: number; stroke?: number; className?: string; color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] ?? paths.check}
    </svg>
  );
}

export const tones: Record<string, { bg: string; fg: string }> = {
  orange: { bg: '#FFEBDD', fg: '#C24E17' },
  navy: { bg: '#E6E9F5', fg: '#1B2A6B' },
  green: { bg: '#E2F6EC', fg: '#1F8A57' },
  amber: { bg: '#FFF1DE', fg: '#B8680E' },
  blue: { bg: '#E3F4FD', fg: '#1C7DB4' },
};

export function IconBubble({ icon, tone = 'orange', size = 52, iconSize = 22 }: {
  icon: string; tone?: string; size?: number; iconSize?: number;
}) {
  const t = tones[tone] ?? tones.orange;
  return (
    <span className="icon-bubble" style={{ width: size, height: size, background: t.bg, color: t.fg }}>
      <Icon name={icon} size={iconSize} />
    </span>
  );
}
