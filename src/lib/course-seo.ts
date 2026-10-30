// Course-specific facts generated from each course's own data (language, level, fees, duration, neighbours),
// so the 73 level pages are not near-copies of each other (Google was folding them together as duplicates).
import { inr } from './format';
import type { CourseRow, Program } from './data';

const CEFR_NAME: Record<string, string> = {
  A1: 'beginner', A2: 'elementary', B1: 'intermediate', B2: 'upper-intermediate', C1: 'advanced', C2: 'proficiency',
};

/** International exam that uses the same level, per program (Edexo publishes prep pages for these). */
function examFor(p: Program | null, level: string | null): string | null {
  if (!p || !level) return null;
  const lv = level.toUpperCase();
  const cefr = /^[ABC][12]$/.test(lv);
  switch (p.slug) {
    case 'german-language-course': return cefr ? `Goethe-Zertifikat ${lv}, telc Deutsch ${lv} and ÖSD ${lv}` : null;
    case 'french-language-course': return cefr ? (lv.startsWith('C') ? `DALF ${lv} and TCF` : `DELF ${lv} and TCF`) : null;
    case 'spanish-language-course': return cefr ? `DELE ${lv} and SIELE` : null;
    case 'italian-language-course': return cefr ? `CILS and CELI (${lv} level)` : null;
    case 'russian-language-course': return cefr ? `TORFL / ТРКИ (${lv} level)` : null;
    case 'japanese-language-course': return /^N[1-5]$/.test(lv) ? `JLPT ${lv}` : null;
    case 'chinese-language-course': { const m = lv.match(/HSK\s*([1-6])/); return m ? `HSK ${m[1]}` : null; }
    case 'korean-language-course': { const m = lv.match(/TOPIK\s*([1-6])/); return m ? `TOPIK level ${m[1]} (${Number(m[1]) <= 2 ? 'TOPIK I' : 'TOPIK II'})` : null; }
    default: return null;
  }
}

function feeText(c: CourseRow): string | null {
  if (c.price && c.priceOffline && c.price !== c.priceOffline) return `${inr(c.price)} for online classes and ${inr(c.priceOffline)} for classroom (offline) classes`;
  if (c.price || c.priceOffline) return `${inr(c.price || c.priceOffline)} (online and offline)`;
  return null;
}

export type CourseFacts = { overview: string[]; faqs: { q: string; a: string }[]; seoTitle: string; seoDescription: string };

export function courseFacts(c: CourseRow, program: Program | null, branchNames: string[]): CourseFacts {
  const lang = program?.category === 'kids' ? program.name : (c.languageName || program?.name || '');
  const lvl = c.level || '';
  const lvName = CEFR_NAME[lvl.toUpperCase()];
  const fee = feeText(c);
  const exam = examFor(program, c.level);
  const sib = program?.courses ?? [];
  const i = sib.findIndex((x) => x.id === c.id);
  const prev = i > 0 ? sib[i - 1] : null;
  const next = i >= 0 && i < sib.length - 1 ? sib[i + 1] : null;
  const centres = branchNames.length ? branchNames.join(' and ') : 'Delhi';
  const kids = program?.category === 'kids';

  const overview = [
    `${c.title} is ${lvName ? `the ${lvName} (${lvl}) level` : lvl ? `the ${lvl} level` : 'a course'} of the ${program?.title || `${lang} program`} at Edexo${kids ? ', taught in a junior batch for ages 8–16' : ''}.`,
    c.duration ? `It usually takes ${c.duration}${fee ? `, and the fee is ${fee}` : ''}.` : fee ? `The fee is ${fee}.` : '',
    prev ? `Join after completing ${prev.title} (or with an equivalent level).` : sib.length > 1 ? `No previous ${lang} knowledge is needed — this is where the ${lang} path starts.` : '',
    next ? `After this level you can continue with ${next.title}.` : sib.length > 1 ? `This is the highest level in our ${lang} path.` : '',
    exam ? `The level matches the ${exam} exam level.` : '',
    `Classes run live online and in our ${centres} classrooms, in group or one-to-one batches.`,
  ].filter(Boolean);

  const faqs: { q: string; a: string }[] = [];
  if (fee) faqs.push({ q: `What is the fee for ${c.title} at Edexo?`, a: `The ${c.title} fee is ${fee}. Fees are confirmed at the time of enrolment.` });
  if (c.duration) faqs.push({ q: `How long does the ${c.title} course take?`, a: `${c.title} usually takes ${c.duration}, depending on the batch schedule (weekday, weekend or fast-track).` });
  faqs.push(prev
    ? { q: `Can I join ${c.title} directly?`, a: `Yes, if you have completed ${prev.title} or already have an equivalent level. Our team can check your level in a free demo class.` }
    : { q: `Do I need any ${lang} knowledge before ${c.title}?`, a: `No. ${c.title} starts from the basics${kids ? ' and is designed for children aged 8–16' : ''}.` });
  if (exam) faqs.push({ q: `Which exam does ${c.title} prepare me for?`, a: `${c.title} matches the ${exam} level. Exam-focused preparation can be added — ask our team when you enquire.` });
  faqs.push({ q: `Is ${c.title} available online and offline?`, a: `Yes. You can join live online classes from anywhere, or classroom batches at our ${centres} centre${branchNames.length > 1 ? 's' : ''}.` });

  const fromFee = c.price || c.priceOffline;
  const seoTitle = `${c.title} Course in Delhi & Online – Fees${fromFee ? ` ${inr(fromFee)}` : ''}, Duration | Edexo`;
  const seoDescription = `${c.title}${lvName ? ` (${lvName})` : ''} ${lang ? `${lang} ` : ''}course at Edexo, Delhi: ${c.duration ? `${c.duration}, ` : ''}${fee ? `fee ${fee}, ` : ''}online & classroom batches${exam ? `, ${exam.split(' and ')[0]} level` : ''}. Free demo.`;
  return { overview, faqs, seoTitle, seoDescription: seoDescription.slice(0, 300) };
}
