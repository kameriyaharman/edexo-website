import {
  Laptop, BookOpen, Award, MapPin, Briefcase, GraduationCap, Plane, Globe, Users, User, Clock, Check, ArrowRight,
  ChevronLeft, ChevronRight, Phone, Mail, Menu, X, Star, Calendar, MessageCircle, Languages, Trophy, Target,
  Sparkles, Heart, Lightbulb, Video, Headphones, FileCheck, BadgeCheck, School, Library, PenTool, Mic, Clock3,
  Rocket, ShieldCheck, Wallet, Gift, Quote, Send, Navigation, Building2, CircleCheck, ChevronDown, Search,
  Home, Info, Newspaper, Contact, Layers, Zap, BookMarked, NotebookPen, Medal, Smile, ThumbsUp, Monitor,
  ListChecks, Handshake, FileText, Upload, Filter, Download, Flag, ExternalLink, Baby, Building, HelpCircle, Plus, Minus,
  type LucideIcon,
} from 'lucide-react';

/** Icon names available to the site and to the admin "Icon" pickers. */
const lucide: Record<string, LucideIcon> = {
  laptop: Laptop, monitor: Monitor, book: BookOpen, bookmark: BookMarked, notebook: NotebookPen, library: Library,
  award: Award, medal: Medal, trophy: Trophy, badge: BadgeCheck, certificate: FileCheck,
  cap: GraduationCap, school: School, languages: Languages, globe: Globe, plane: Plane, briefcase: Briefcase,
  pin: MapPin, navigation: Navigation, building: Building2,
  users: Users, user: User, smile: Smile, heart: Heart, thumbsUp: ThumbsUp,
  clock: Clock, clock3: Clock3, calendar: Calendar,
  target: Target, sparkles: Sparkles, lightbulb: Lightbulb, rocket: Rocket, zap: Zap, layers: Layers,
  video: Video, headphones: Headphones, mic: Mic, pen: PenTool,
  shield: ShieldCheck, wallet: Wallet, gift: Gift,
  check: Check, checkCircle: CircleCheck, arrowRight: ArrowRight, chevronLeft: ChevronLeft, chevronRight: ChevronRight,
  chevronDown: ChevronDown, phone: Phone, mail: Mail, menu: Menu, close: X, star: Star, chat: MessageCircle,
  quote: Quote, send: Send, search: Search, home: Home, info: Info, news: Newspaper, contact: Contact,
  listChecks: ListChecks, handshake: Handshake, file: FileText, upload: Upload, filter: Filter, download: Download,
  flag: Flag, external: ExternalLink, kids: Baby, office: Building, help: HelpCircle, plus: Plus, minus: Minus,
};

/* Brand marks drawn as simple glyphs (lucide no longer ships brand icons). */
const brands: Record<string, React.ReactNode> = {
  facebook: <path d="M14 8.5h2.5V5H14a4 4 0 0 0-4 4v2H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9.2c0-.4.3-.7.7-.7z" fill="currentColor" stroke="none" />,
  instagram: (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" /></>),
  linkedin: (<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7.5 10v7M7.5 7v.01M11 17v-4a2.5 2.5 0 0 1 5 0v4M11 10v7" /></>),
  youtube: (<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5v5l4.3-2.5z" fill="currentColor" /></>),
  whatsapp: (<><path d="M4 20l1.3-4A8 8 0 1 1 8.4 19z" /><path d="M9.2 8.6c.2-.4.5-.4.8-.4h.4c.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .4-.1.5l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.4-.2.5-.1l1.5.6c.3.1.4.3.4.5v.4c0 .3 0 .6-.4.8-.5.3-1.3.5-2.2.2-2-.7-3.6-2.3-4.3-4.3-.3-.9-.1-1.7.2-2.2z" fill="currentColor" stroke="none" /></>),
};

export const iconNames = Object.keys(lucide);

export function Icon({ name, size = 20, stroke = 2, className, color = 'currentColor' }: {
  name: string; size?: number; stroke?: number; className?: string; color?: string;
}) {
  if (brands[name]) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" style={{ color }}>
        {brands[name]}
      </svg>
    );
  }
  const C = lucide[name] ?? Check;
  return <C size={size} strokeWidth={stroke} color={color} className={className} aria-hidden="true" />;
}

export const tones: Record<string, { bg: string; fg: string }> = {
  orange: { bg: '#FFE6D5', fg: '#E8540A' },
  navy: { bg: '#E3E8FB', fg: '#1A2E8C' },
  green: { bg: '#DDF7EA', fg: '#12A15E' },
  amber: { bg: '#FFF0D6', fg: '#E08A00' },
  blue: { bg: '#DDF1FE', fg: '#0B8AD6' },
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

/** Pick a sensible icon for a free-text label (menu items, highlights, ticks). */
export function iconFor(label: string): string {
  const l = label.toLowerCase();
  const rules: [RegExp, string][] = [
    [/home/, 'home'], [/about/, 'info'], [/faq/, 'help'], [/franchise/, 'handshake'], [/kids/, 'kids'], [/corporate|business/, 'office'],
    [/one-to-one|personal/, 'user'], [/group|together/, 'users'], [/international|anywhere|world/, 'globe'], [/online/, 'laptop'],
    [/goethe|telc|ösd|osd|testdaf|ielts|pte|toefl|delf|dalf|tcf|dele|siele|jlpt|hsk|topik|mock/, 'target'],
    [/ausbildung/, 'briefcase'], [/fee|price/, 'wallet'],
    [/course|level|a1|b1|c1|c2/, 'cap'], [/german|french|italian|japanese|spanish|chinese|arabic|portuguese|korean|russian|english|language/, 'languages'],
    [/blog|article|news/, 'news'], [/contact|call/, 'phone'], [/privacy|terms|policy|disclaimer|cookie|refund/, 'shield'],
    [/demo/, 'video'], [/certif/, 'award'], [/trainer|teacher|expert/, 'users'], [/exam|test/, 'target'],
    [/online|offline/, 'laptop'], [/material|book/, 'book'], [/batch|schedule|time/, 'calendar'], [/visa|abroad|germany|travel/, 'plane'],
    [/job|career|work/, 'briefcase'], [/universit|study/, 'cap'], [/mumbai|pune|jaipur|delhi|rohini|dwarka|centre|center/, 'pin'],
  ];
  return rules.find(([r]) => r.test(l))?.[1] ?? 'checkCircle';
}
