// Content for the "international language platform" upgrade (Edexo developer documents, Oct 2026).
// Used once by scripts/seed.mjs → upgrades(). Everything here stays editable in the admin panel.
// Rules from the brief: no "No.1"/"100%"/guarantee claims; no invented refund %, franchise money or exam promises.

const L = (s) => s.trim().split('\n').map((x) => x.trim()).filter(Boolean).join('\n');
const faq = (pairs) => pairs.map(([q, a]) => `${q}\n${a}`).join('\n\n');

/* ---------- generic level descriptions (CEFR-style) ---------- */
const CEFR = {
  A1: { name: 'Beginner', text: 'greetings and introductions, pronunciation, numbers, dates and time, family, daily routines, food, shopping, directions and basic grammar', out: ['Introduce yourself and others', 'Ask and answer simple questions', 'Understand common everyday expressions', 'Handle basic shopping and travel situations', 'Build foundational grammar and vocabulary'] },
  A2: { name: 'Elementary', text: 'everyday communication about travel, work, health, shopping, hobbies and past experiences, with stronger grammar and vocabulary', out: ['Describe experiences and plans', 'Handle common travel and daily situations', 'Talk about work and personal life', 'Understand routine spoken and written language'] },
  B1: { name: 'Intermediate', text: 'independent communication, expressing opinions, describing experiences, understanding longer texts and writing structured messages', out: ['Take part in conversations on familiar topics', 'Express opinions and give reasons', 'Understand longer conversations and texts', 'Write structured messages and short texts'] },
  B2: { name: 'Upper-Intermediate', text: 'complex conversations, discussions, professional vocabulary, presentations, advanced grammar and longer reading and listening', out: ['Discuss a wide range of topics fluently', 'Follow complex conversations and texts', 'Give presentations and write detailed texts', 'Communicate in professional situations'] },
  C1: { name: 'Advanced', text: 'advanced academic and professional language, complex discussions, presentations, argumentation, critical reading and advanced writing', out: ['Express ideas fluently and precisely', 'Understand demanding, longer texts', 'Use the language effectively for study and work', 'Write clear, well-structured complex texts'] },
  C2: { name: 'Proficiency / Mastery', text: 'highly advanced, precise and nuanced communication, complex texts, sophisticated writing and academic and professional language use', out: ['Understand virtually everything heard or read', 'Express yourself spontaneously and precisely', 'Handle complex academic and professional communication'] },
};
const FORMAT = 'Online & Offline · Group & One-to-One (subject to batch availability)';

function course(p) {
  const outcomes = (p.outcomes || []).join('\n');
  const body = `## About this course\n\n${p.intro}${p.syllabus ? `\n\n## What you will learn\n\n${p.syllabus}` : ''}`;
  return {
    format: FORMAT, studyMaterial: p.studyMaterial ?? '', timings: 'Weekday and weekend batch timings are shared when you enquire.', eligibility: p.eligibility ?? '',
    highlights: L(`
      Free demo class
      Live online or classroom batches
      Group and one-to-one options
      Regular practice and assessments`),
    ...p, outcomes, description: body,
  };
}

function cefrCourses({ lang, prefix, slugBase, fees, duration, extra = {}, kids = false, mrp = {} }) {
  return Object.keys(CEFR).map((lvl, i) => {
    const c = CEFR[lvl];
    const fee = fees?.[lvl];
    const who = kids
      ? `Children aged 8–16 learning ${lang} in a junior batch${lvl === 'A1' ? ', including complete beginners' : ` who have completed the previous level`}.`
      : lvl === 'A1' ? `Complete beginners, students and professionals starting ${lang} from scratch.`
        : `Learners who have completed ${Object.keys(CEFR)[i - 1]} or have an equivalent level of ${lang}.`;
    return course({
      level: lvl, slug: `${slugBase}-${lvl.toLowerCase()}${kids ? '' : '-course'}`,
      title: `${prefix} ${lvl}`,
      price: fee ? fee[0] : null, priceOffline: fee ? fee[1] : null, mrp: mrp[lvl] ?? null,
      duration: typeof duration === 'function' ? duration(lvl) : duration,
      shortDesc: `${c.name}: ${c.text.split(',').slice(0, 3).join(',')}.`,
      intro: `${kids ? 'A junior batch for ages 8–16. ' : ''}The ${lvl} (${c.name}) level of our ${lang} program covers ${c.text}.${extra[lvl] ? ' ' + extra[lvl] : ''}`,
      syllabus: `Speaking, listening, reading and writing practice, with grammar and vocabulary built step by step.`,
      outcomes: c.out, whoShouldJoin: who, sort: i,
    });
  });
}

/* ---------- programs ---------- */
export const programs = [
  {
    slug: 'german-language-course', oldSlug: 'german', name: 'German', code: 'DE', category: 'language', icon: 'languages', sort: 0,
    title: 'German Language Course A1–C2', tagline: 'Learn German from A1 to C2 — online & offline',
    intro: 'Structured German programs for study, work, exams and everyday communication in Germany.',
    description: `## Learn German from A1 to C2

Our German language programs are designed for beginners, students, professionals and international learners who want to develop German language skills for everyday communication, education, examinations and professional environments.

Classes may be offered **online and offline**, in **groups or one-to-one**, depending on availability.`,
    highlights: L(`
      A1 to C2 levels — Beginner to mastery in a structured pathway
      Online & offline — Live classes in Delhi or from anywhere
      Group & one-to-one — Choose the format that suits you
      Exam preparation — Goethe, TELC, ÖSD and TestDaF preparation
      Study & work in Germany — Language skills for university, Ausbildung and jobs
      Free demo class — Meet the trainer before you enrol`),
    examPrep: 'Depending on the active Edexo offering, preparation may include Goethe, TELC, ÖSD and TestDaF. Training covers reading, listening, writing, speaking, mock tests, exam strategies, time management and feedback.',
    feeNote: 'German fees are the same for online and offline classes. Duration: as per the active batch/course schedule.',
    showOnHome: true, homeTitle: 'German A1–C2', homeBlurb: 'Complete German pathway from beginner to advanced level for study, work, exams and communication.',
    seoTitle: 'German Language Course A1–C2 in Delhi & Online | Edexo',
    seoDescription: 'Learn German from A1 to C2 with Edexo — online and offline classes in Rohini & Dwarka, Delhi. Group or one-to-one, exam preparation and a free demo class.',
    faqs: faq([
      ['Which German level should I start with?', 'Complete beginners start at A1. If you have studied German before, our team can help you identify the right level before you join.'],
      ['Are German fees different for online and offline classes?', 'No. German course fees are the same for online and offline classes. See the fee table on this page.'],
      ['Do you offer German exam preparation?', 'Yes, preparation for German exams such as Goethe, TELC, ÖSD and TestDaF is available as part of our exam preparation programs. Ask our team about current batches.'],
      ['Can I learn German online from outside India?', 'Yes. International students can join our live online German classes and choose timings that suit their time zone.'],
    ]),
    courses: [
      course({ level: 'A1', slug: 'german-a1-course', oldSlug: 'german-a1', title: 'German A1', price: 16499, priceOffline: 16499, mrp: 20000, duration: 'As per batch schedule', sort: 0,
        shortDesc: 'Start from zero: alphabet, pronunciation, greetings and everyday conversation.',
        intro: 'Start your German journey with the A1 level. Learn pronunciation, alphabet, greetings, introductions, numbers, dates, time, family, daily routines, food, shopping, directions and basic everyday communication.',
        syllabus: 'Alphabet and pronunciation, basic vocabulary, greetings, numbers, dates, time, family, daily activities, food, shopping, directions, travel and basic grammar. Skills: speaking, listening, reading and writing.',
        outcomes: ['Introduce yourself and others', 'Ask and answer basic questions', 'Understand common everyday expressions', 'Talk about family and routine', 'Handle basic shopping and travel situations', 'Build basic grammar and vocabulary', 'Develop foundational speaking, listening, reading and writing skills'],
        whoShouldJoin: 'Complete beginners, students planning to learn German from scratch, professionals and learners preparing for a long-term German learning pathway.' }),
      course({ level: 'A2', slug: 'german-a2-course', oldSlug: 'german-a2', title: 'German A2', price: 17499, priceOffline: 17499, mrp: 21500, duration: 'As per batch schedule', sort: 1,
        shortDesc: 'Everyday situations: travel, work, health, shopping and past experiences.',
        intro: 'A2 develops the ability to communicate in familiar everyday situations. Topics include travel, work, health, shopping, hobbies, experiences, appointments and routine communication.',
        syllabus: 'Everyday communication, travel, work, health, shopping, hobbies, past experiences and stronger grammar and communication skills.',
        outcomes: ['Describe experiences and plans', 'Handle common travel and daily situations', 'Communicate about work and personal life', 'Understand routine spoken and written German', 'Improve grammar, vocabulary and sentence formation', 'Develop all four language skills'],
        whoShouldJoin: 'Learners who have completed German A1 or have an equivalent level.' }),
      course({ level: 'B1', slug: 'german-b1-course', oldSlug: 'german-b1', title: 'German B1', price: 18499, priceOffline: 18499, mrp: 23000, duration: 'As per batch schedule', sort: 2,
        shortDesc: 'Independent communication: opinions, workplace German and structured writing.',
        intro: 'B1 focuses on independent communication. Students learn to express opinions, explain experiences, communicate in workplace situations, understand longer texts and produce structured written responses.',
        syllabus: 'Independent communication, workplace German, opinions, presentations, longer texts and structured writing.',
        outcomes: ['Participate in conversations on familiar topics', 'Express opinions and reasons', 'Understand longer conversations and texts', 'Write structured messages and texts', 'Improve workplace communication', 'Prepare for relevant German examinations where offered'],
        whoShouldJoin: 'Learners who have completed German A2 or have an equivalent level — including students planning to study, work or pursue Ausbildung in Germany.' }),
      course({ level: 'B2', slug: 'german-b2-course', oldSlug: 'german-b2', title: 'German B2', price: 29499, priceOffline: 29499, mrp: 32000, duration: 'As per batch schedule', sort: 3,
        shortDesc: 'Upper-intermediate German in two parts — B2.1 and B2.2.',
        intro: 'B2 is taught in two parts. **B2.1** develops upper-intermediate communication through complex conversations, professional vocabulary, presentations, reading and listening activities and advanced grammar. **B2.2** continues with discussions, professional interaction, structured writing, advanced reading/listening and examination-oriented practice.',
        syllabus: '**B2.1:** complex conversations, professional vocabulary, reading/listening, presentations and advanced grammar.\n\n**B2.2:** advanced speaking, discussions, professional communication, advanced writing/reading/listening and exam practice.',
        outcomes: ['Hold complex conversations and discussions', 'Use professional vocabulary confidently', 'Give presentations in German', 'Write structured, detailed texts', 'Practise for B2-level examinations'],
        whoShouldJoin: 'Learners who have completed German B1 — especially those preparing for study, work or B2-level exams.' }),
      course({ level: 'C1', slug: 'german-c1-course', oldSlug: 'german-c1', title: 'German C1', price: 31500, priceOffline: 31500, mrp: 36000, duration: 'As per batch schedule', sort: 4,
        shortDesc: 'Advanced academic and professional German.',
        intro: 'C1 focuses on advanced academic and professional German, including complex discussions, presentations, argumentation, critical reading, advanced writing and nuanced listening comprehension.',
        syllabus: 'Advanced academic and professional vocabulary, complex discussions, presentations, critical reading, writing, listening and argumentation.',
        outcomes: ['Take part in complex academic and professional discussions', 'Present and argue a point clearly', 'Read demanding texts critically', 'Write advanced, well-structured texts'],
        whoShouldJoin: 'Learners who have completed German B2 and need advanced German for university or professional work.' }),
      course({ level: 'C2', slug: 'german-c2-course', oldSlug: 'german-c2', title: 'German C2', price: 32000, priceOffline: 32000, mrp: 37500, duration: 'As per batch schedule', sort: 5,
        shortDesc: 'The highest level: precise, nuanced German for academic and professional use.',
        intro: 'C2 is the highest level of the program and focuses on highly advanced, precise and nuanced communication, complex texts, sophisticated writing, presentations and academic/professional language use.',
        syllabus: 'Highly advanced communication, nuanced language use, complex texts, advanced writing and professional/academic communication.',
        outcomes: ['Communicate with precision and nuance', 'Understand complex texts of all kinds', 'Write sophisticated academic and professional texts'],
        whoShouldJoin: 'Learners who have completed German C1 and want mastery-level German.' }),
    ],
  },
  {
    slug: 'french-language-course', oldSlug: 'french', name: 'French', code: 'FR', category: 'language', sort: 1,
    title: 'French Language Course', tagline: 'Learn French from beginner to advanced',
    intro: "Edexo's French language program develops practical communication skills for everyday, academic and professional situations.",
    description: `## Learn French from Beginner to Advanced

Edexo's French language program develops practical communication skills for everyday, academic and professional situations. Courses can be structured across A1–C2 progression depending on the program offered.

- **Beginner / A1:** greetings, introductions, pronunciation, numbers, dates, family, daily routines, food, shopping, directions, basic grammar and everyday communication.
- **A2:** travel, work, health, hobbies, appointments, experiences, conversations and stronger grammar and vocabulary.
- **B1–B2:** independent communication, opinions, discussions, longer texts, structured writing, presentations and professional communication.
- **C1–C2:** advanced vocabulary, complex texts, academic/professional communication, argumentation, presentations and nuanced language use.`,
    examPrep: 'Where actively offered: DELF, DALF and TCF preparation covering the relevant skills and exam strategies.',
    feeNote: 'Fees for levels without a price are shared on enquiry.',
    showOnHome: true, homeTitle: 'French', homeBlurb: 'Structured French learning from beginner to advanced level.',
    seoTitle: 'French Language Course A1–C2 — Online & Offline | Edexo',
    seoDescription: 'Learn French from beginner to advanced with Edexo. A1–C2 progression, online and offline classes, DELF/DALF/TCF preparation and a free demo class.',
    courses: cefrCourses({ lang: 'French', prefix: 'French', slugBase: 'french', duration: 'As per batch schedule', fees: { A1: [19999, 19999] }, mrp: { A1: 24999 } }).map((c) => c.level === 'A1' ? { ...c, oldSlug: 'french-a1' } : c),
  },
  {
    slug: 'spanish-language-course', name: 'Spanish', code: 'ES', category: 'language', sort: 2,
    title: 'Spanish Language Course', tagline: 'Practical Spanish for travel, study and work',
    intro: 'Develop Spanish communication skills for travel, education, professional communication and personal growth.',
    description: `## Learn Spanish from Beginner to Advanced

Develop Spanish communication skills for travel, education, professional communication and personal growth. Our levels progress from beginner through elementary, intermediate and upper-intermediate to advanced, covering greetings, daily communication, travel, work, grammar, vocabulary, speaking, listening, reading and writing.`,
    examPrep: 'Where actively offered: DELE and SIELE preparation with practice across the required skills.',
    feeNote: 'Duration: 2 to 6 months per level.',
    showOnHome: true, homeTitle: 'Spanish', homeBlurb: 'Practical Spanish for communication, travel, education and professional goals.',
    seoTitle: 'Spanish Language Course A1–C2 — Online & Offline | Edexo',
    seoDescription: 'Learn Spanish from A1 to C2 with Edexo — online and offline classes, group or one-to-one, DELE/SIELE preparation and a free demo class.',
    courses: cefrCourses({ lang: 'Spanish', prefix: 'Spanish', slugBase: 'spanish', duration: '2 to 6 months',
      fees: { A1: [15000, 20000], A2: [17000, 22000], B1: [19000, 22000], B2: [21000, 20000], C1: [23000, 30000], C2: [23000, 34000] } }),
  },
  {
    slug: 'japanese-language-course', oldSlug: 'japanese', name: 'Japanese', code: 'JP', category: 'language', levelLabel: 'JLPT level', sort: 3,
    title: 'Japanese Language Course N5–N1', tagline: 'Progressive Japanese with JLPT-oriented preparation',
    intro: 'Japanese from N5 to N1 — kana, kanji, vocabulary, grammar, reading, listening and communication.',
    description: `## Japanese N5–N1

Progressive Japanese learning with JLPT-oriented preparation. Our program covers Hiragana and Katakana, Kanji, vocabulary, grammar, reading, listening and practical communication, level by level from N5 to N1.`,
    examPrep: 'JLPT preparation can include vocabulary, Kanji, grammar, reading, listening and practice tests for N5–N1, according to the active program.',
    feeNote: 'Duration: 3 to 9 months per level.',
    showOnHome: true, homeTitle: 'Japanese N5–N1', homeBlurb: 'Progressive Japanese learning with JLPT-oriented preparation.',
    seoTitle: 'Japanese Language Course N5–N1 & JLPT Preparation | Edexo',
    seoDescription: 'Learn Japanese from N5 to N1 with Edexo — Hiragana, Katakana, Kanji, grammar and JLPT preparation. Online and offline classes with a free demo.',
    courses: [
      ['N5', 17000, 23000, 'Basic greetings, introductions, Hiragana, Katakana, foundational Kanji, basic grammar, vocabulary and simple conversations.'],
      ['N4', 19000, 25000, 'Elementary communication, expanded vocabulary and Kanji, everyday situations, grammar, reading and listening.'],
      ['N3', 21000, 27000, 'Intermediate Japanese with broader vocabulary, grammar, reading, listening and practical communication.'],
      ['N2', 23000, 29000, 'Upper-intermediate Japanese for complex communication, advanced reading/listening and professional or academic contexts.'],
      ['N1', 25000, 31000, 'Advanced Japanese focusing on complex texts, nuanced vocabulary, advanced grammar, reading and listening.'],
    ].map(([lvl, on, off, txt], i) => course({
      level: lvl, slug: `japanese-${lvl.toLowerCase()}-course`, oldSlug: i === 0 ? 'japanese' : undefined, title: `Japanese ${lvl}`,
      price: on, priceOffline: off, duration: '3 to 9 months', sort: i, shortDesc: txt.split(',').slice(0, 3).join(',') + '.',
      intro: `The ${lvl} level of our Japanese program: ${txt}`, syllabus: txt, examPrep: `JLPT ${lvl}-oriented practice according to the active program.`,
      outcomes: [], whoShouldJoin: i === 0 ? 'Complete beginners starting Japanese.' : `Learners who have completed the previous level or have an equivalent level of Japanese.`,
    })),
  },
  {
    slug: 'chinese-language-course', name: 'Chinese', code: 'ZH', category: 'language', levelLabel: 'HSK level', sort: 4,
    title: 'Chinese (Mandarin) Course — HSK 1 to 6', tagline: 'Mandarin with Pinyin, tones, characters and HSK preparation',
    intro: 'Build practical Chinese communication skills through Pinyin, tones, vocabulary, characters, grammar, listening, reading and speaking.',
    description: `## Learn Chinese / Mandarin from Beginner to Advanced

Build practical Chinese communication skills through Pinyin, tones, vocabulary, characters, grammar, listening, reading and speaking.

- **Foundation:** pronunciation, tones, Pinyin, greetings, introductions, numbers and daily expressions.
- **Intermediate:** everyday communication, grammar, characters, reading, listening and longer conversations.
- **Advanced:** more complex communication, professional vocabulary, longer texts and advanced comprehension.`,
    examPrep: 'Where offered, HSK-oriented preparation can cover vocabulary, characters, grammar, reading, listening and practice tests.',
    feeNote: 'Duration: 3 to 6 months per level.',
    showOnHome: true, homeTitle: 'Chinese', homeBlurb: 'Mandarin-focused learning covering pronunciation, tones, characters and communication.',
    seoTitle: 'Chinese (Mandarin) Course HSK 1–6 — Online & Offline | Edexo',
    seoDescription: 'Learn Mandarin Chinese with Edexo — Pinyin, tones, characters and HSK 1–6 oriented preparation. Online and offline classes with a free demo.',
    courses: [[1, 15000, 20000], [2, 18000, 23000], [3, 21000, 28000], [4, 21000, 26000], [5, 25000, 30000], [6, 25000, 30000]].map(([n, on, off], i) => {
      const stage = n <= 2 ? ['Foundation', 'pronunciation, tones, Pinyin, greetings, introductions, numbers and daily expressions'] : n <= 4 ? ['Intermediate', 'everyday communication, grammar, characters, reading, listening and longer conversations'] : ['Advanced', 'more complex communication, professional vocabulary, longer texts and advanced comprehension'];
      return course({ level: `HSK ${n}`, slug: `chinese-hsk-${n}-course`, title: `Chinese HSK ${n}`, price: on, priceOffline: off, duration: '3 to 6 months', sort: i,
        shortDesc: `${stage[0]} Mandarin: ${stage[1].split(',').slice(0, 3).join(',')}.`,
        intro: `HSK ${n} is part of the ${stage[0].toLowerCase()} stage of our Chinese program, covering ${stage[1]}.`, syllabus: `${stage[1][0].toUpperCase()}${stage[1].slice(1)}.`,
        examPrep: `HSK ${n}-oriented vocabulary, characters, grammar, reading and listening practice where offered.`, outcomes: [],
        whoShouldJoin: n === 1 ? 'Complete beginners starting Mandarin Chinese.' : `Learners who have completed HSK ${n - 1} or have an equivalent level.` });
    }),
  },
  {
    slug: 'spoken-english-course', name: 'English', code: 'EN', category: 'language', sort: 5,
    title: 'English & Communication', tagline: 'Improve your English. Communicate with confidence.',
    intro: 'Spoken English and Business English for beginners through advanced learners.',
    description: `## Improve Your English. Communicate With Confidence.

Edexo offers English learning for beginners through advanced learners, including Spoken English and Business English, subject to the active program structure.`,
    examPrep: 'Where actively offered: IELTS, PTE and TOEFL preparation.',
    feeNote: 'Fees are shared on enquiry.',
    showOnHome: true, homeTitle: 'English & Communication', homeBlurb: 'Spoken English and professional communication programs.',
    seoTitle: 'Spoken English & Business English Course | Edexo',
    seoDescription: 'Spoken English and Business English classes with Edexo — grammar, pronunciation, conversation, emails, meetings and presentations. IELTS/PTE/TOEFL preparation.',
    courses: [
      course({ level: 'All levels', slug: 'spoken-english-classes', title: 'Spoken English', price: null, priceOffline: null, duration: 'As per batch schedule', sort: 0,
        shortDesc: 'Grammar, vocabulary, pronunciation and everyday conversation.',
        intro: 'Grammar foundations, vocabulary, pronunciation, everyday conversation, speaking confidence, listening and practical communication.',
        syllabus: 'Grammar foundations, vocabulary, pronunciation, everyday conversation, speaking confidence, listening and practical communication.', outcomes: ['Speak with more confidence', 'Improve pronunciation and fluency', 'Build everyday vocabulary and grammar'], whoShouldJoin: 'Students, job seekers and professionals who want to speak English with more confidence.' }),
      course({ level: 'Professional', slug: 'business-english-course', title: 'Business English', price: null, priceOffline: null, duration: 'As per batch schedule', sort: 1,
        shortDesc: 'Emails, meetings, presentations and workplace communication.',
        intro: 'Professional vocabulary, emails, meetings, presentations, workplace communication and client interaction.',
        syllabus: 'Professional vocabulary, emails, meetings, presentations, workplace communication and client interaction.', outcomes: ['Write clear professional emails', 'Take part in meetings confidently', 'Present ideas clearly'], whoShouldJoin: 'Working professionals and job seekers who use English at work.' }),
    ],
  },
  {
    slug: 'italian-language-course', oldSlug: 'italian', name: 'Italian', code: 'IT', category: 'language', sort: 6,
    title: 'Italian Language Course A1–C2', tagline: 'Italian from beginner to mastery',
    intro: 'Italian from A1 to C2 with speaking, listening, reading and writing practice.',
    description: `## Learn Italian from A1 to C2

A structured Italian program from beginner to advanced, covering speaking, listening, reading, writing, grammar and vocabulary for everyday, academic and professional communication.`,
    feeNote: 'Duration: minimum 3 months per level.',
    seoTitle: 'Italian Language Course A1–C2 — Online & Offline | Edexo',
    seoDescription: 'Learn Italian from A1 to C2 with Edexo — online and offline classes, group or one-to-one, with a free demo class.',
    courses: cefrCourses({ lang: 'Italian', prefix: 'Italian', slugBase: 'italian', duration: 'Minimum 3 months',
      fees: { A1: [23000, 25000], A2: [25000, 27000], B1: [27000, 30000], B2: [29000, 30000], C1: [33000, 35000], C2: [35000, 40000] } }).map((c) => c.level === 'A1' ? { ...c, oldSlug: 'italian' } : c),
  },
  {
    slug: 'korean-language-course', name: 'Korean', code: 'KO', category: 'language', levelLabel: 'TOPIK level', sort: 7,
    title: 'Korean Language Course — TOPIK 1 to 6', tagline: 'Korean from Hangul to advanced',
    intro: 'Korean from TOPIK 1 to TOPIK 6 — Hangul, pronunciation, vocabulary, grammar and communication.',
    description: `## Learn Korean — TOPIK 1 to 6

A level-by-level Korean program starting with the Hangul alphabet and pronunciation and progressing through vocabulary, grammar, reading, listening, speaking and writing up to advanced communication.`,
    feeNote: 'Duration: 3 to 6 months per level.',
    seoTitle: 'Korean Language Course TOPIK 1–6 — Online & Offline | Edexo',
    seoDescription: 'Learn Korean with Edexo from TOPIK 1 to 6 — Hangul, grammar, vocabulary and communication. Online and offline classes with a free demo.',
    courses: [[1, 13000, 18000], [2, 17000, 22000], [3, 20000, 25000], [4, 22000, 27000], [5, 25000, 30000], [6, 25000, 35000]].map(([n, on, off], i) => {
      const t = n <= 2 ? 'Hangul, pronunciation, greetings, numbers, basic vocabulary and everyday expressions' : n <= 4 ? 'everyday and workplace communication, broader grammar and vocabulary, reading and listening' : 'advanced communication, complex texts, professional and academic vocabulary';
      return course({ level: `TOPIK ${n}`, slug: `korean-topik-${n}-course`, title: `Korean TOPIK ${n}`, price: on, priceOffline: off, duration: '3 to 6 months', sort: i,
        shortDesc: `${t.split(',').slice(0, 3).join(',')}.`, intro: `TOPIK ${n} level of our Korean program, covering ${t}.`, syllabus: `${t[0].toUpperCase()}${t.slice(1)}.`, outcomes: [],
        whoShouldJoin: n === 1 ? 'Complete beginners starting Korean.' : `Learners who have completed TOPIK ${n - 1} or have an equivalent level.` });
    }),
  },
  {
    slug: 'arabic-language-course', name: 'Arabic', code: 'AR', category: 'language', sort: 8,
    title: 'Arabic Language Course A1–C2', tagline: 'Practical Arabic from the alphabet up',
    intro: 'Build Arabic foundations through alphabet and pronunciation, vocabulary, greetings, numbers, everyday expressions, reading, writing, listening and speaking.',
    description: `## Arabic from Beginner to Advanced

Build Arabic language foundations through alphabet and pronunciation, vocabulary, greetings, numbers, family, everyday expressions, reading, writing, listening and speaking.

**Who should learn?** Students, professionals, travellers, international learners and anyone seeking practical Arabic communication skills.

Live online Arabic classes can be offered with structured lessons and flexible learning options, subject to availability.`,
    feeNote: 'Arabic fees are the same for online and offline classes.',
    seoTitle: 'Arabic Language Course A1–C2 — Online & Offline | Edexo',
    seoDescription: 'Learn Arabic from A1 to C2 with Edexo — alphabet, pronunciation, vocabulary, reading, writing and speaking. Online and offline classes with a free demo.',
    courses: cefrCourses({ lang: 'Arabic', prefix: 'Arabic', slugBase: 'arabic', duration: (l) => (['A1', 'A2'].includes(l) ? '3 months' : '6 months'),
      extra: { A1: 'Includes the Arabic alphabet and pronunciation.' },
      fees: { A1: [13000, 13000], A2: [23000, 23000], B1: [23000, 23000], B2: [27000, 27000], C1: [20000, 20000], C2: [35000, 35000] } }),
  },
  {
    slug: 'russian-language-course', name: 'Russian', code: 'RU', category: 'language', sort: 9,
    title: 'Russian Language Course A1–C2', tagline: 'Russian from Cyrillic to advanced',
    intro: 'Russian from A1 to C2 — Cyrillic alphabet, pronunciation, grammar, vocabulary and communication.',
    description: `## Learn Russian from A1 to C2

A structured Russian program that starts with the Cyrillic alphabet and pronunciation and progresses through grammar, vocabulary, reading, listening, speaking and writing up to advanced communication.`,
    feeNote: 'Duration: 3 to 6 months per level.',
    seoTitle: 'Russian Language Course A1–C2 — Online & Offline | Edexo',
    seoDescription: 'Learn Russian from A1 to C2 with Edexo — Cyrillic, grammar and communication. Online and offline classes with a free demo.',
    courses: cefrCourses({ lang: 'Russian', prefix: 'Russian', slugBase: 'russian', duration: '3 to 6 months', extra: { A1: 'Includes the Cyrillic alphabet and pronunciation.' },
      fees: { A1: [15000, 20000], A2: [17000, 22000], B1: [19000, 24000], B2: [21000, 29000], C1: [24000, 29000], C2: [28000, 32000] } }),
  },
  {
    slug: 'portuguese-language-course', name: 'Portuguese', code: 'PT', category: 'language', sort: 10,
    title: 'Portuguese Language Course A1–C2', tagline: 'Portuguese from beginner to mastery',
    intro: 'A structured progression from beginner to advanced communication in Portuguese.',
    description: `## Portuguese A1–C2

A structured progression from beginner to advanced communication, covering speaking, listening, reading, writing, grammar, vocabulary and practical communication.

**Levels:** A1 Beginner · A2 Elementary · B1 Intermediate · B2 Upper-Intermediate · C1 Advanced · C2 Mastery`,
    feeNote: 'Fees are shared on enquiry.',
    seoTitle: 'Portuguese Language Course A1–C2 | Edexo',
    seoDescription: 'Learn Portuguese from A1 to C2 with Edexo — speaking, listening, reading, writing and practical communication. Online and offline classes.',
    courses: cefrCourses({ lang: 'Portuguese', prefix: 'Portuguese', slugBase: 'portuguese', duration: 'As per batch schedule', fees: {} }),
  },
  {
    slug: 'german-for-kids', name: 'German for Kids', code: 'DE', category: 'kids', sort: 11,
    title: 'German for Kids — Junior Batch (Age 8–16)', tagline: 'German A1–C2 for children aged 8 to 16',
    intro: 'Junior German batches for children aged 8–16, online and offline.',
    description: `## German for Kids (Age 8–16)

Junior batches that help children learn German step by step from A1 to C2, with age-appropriate lessons covering speaking, listening, reading and writing. Available online and offline, subject to batch availability.`,
    feeNote: 'Duration: 3 to 6 months per level.',
    seoTitle: 'German Classes for Kids (Age 8–16) — Online & Offline | Edexo',
    seoDescription: 'Junior German batches for children aged 8–16 — A1 to C2, online and offline, with a free demo class.',
    courses: cefrCourses({ lang: 'German', prefix: 'German for Kids', slugBase: 'german-kids', duration: '3 to 6 months', kids: true,
      fees: { A1: [10000, 15000], A2: [11000, 17000], B1: [13000, 20000], B2: [15000, 25000], C1: [18000, 30000], C2: [21000, 30000] } }),
  },
  {
    slug: 'french-for-kids', name: 'French for Kids', code: 'FR', category: 'kids', sort: 12,
    title: 'French for Kids — Junior Batch (Age 8–16)', tagline: 'French A1–C2 for children aged 8 to 16',
    intro: 'Junior French batches for children aged 8–16, online and offline.',
    description: `## French for Kids (Age 8–16)

Junior batches that help children learn French step by step from A1 to C2, with age-appropriate lessons covering speaking, listening, reading and writing. Available online and offline, subject to batch availability.`,
    feeNote: 'Duration: 3 to 6 months per level.',
    seoTitle: 'French Classes for Kids (Age 8–16) — Online & Offline | Edexo',
    seoDescription: 'Junior French batches for children aged 8–16 — A1 to C2, online and offline, with a free demo class.',
    courses: cefrCourses({ lang: 'French', prefix: 'French for Kids', slugBase: 'french-kids', duration: '3 to 6 months', kids: true,
      fees: { A1: [10000, 15000], A2: [11000, 15000], B1: [13000, 20000], B2: [15000, 20000], C1: [18000, 25000], C2: [21000, 25000] } }),
  },
];

/* ---------- landing / service / exam / legal pages ---------- */
const PREP_INCLUDES = L(`
  Reading practice
  Listening practice
  Writing practice
  Speaking practice
  Mock tests
  Exam strategy
  Time management
  Feedback and correction
  Practice materials where applicable`);
const EXAM_DISCLAIMER = 'Preparation is offered according to Edexo\'s active programs and batches. Exam registration, dates and results are managed by the official exam bodies.';

function examPage(slug, title, group, intro, about, sort) {
  return {
    slug, kind: 'exam', groupName: group, title, sort,
    subtitle: intro,
    content: `## About the exam\n\n${about}\n\n## How Edexo prepares you\n\nStructured lessons, skill-by-skill practice, mock tests, exam strategies and feedback — aligned with the actual exam format and your target level or score.`,
    highlightsTitle: 'Preparation includes', highlights: PREP_INCLUDES, disclaimer: EXAM_DISCLAIMER,
    ctaTitle: `Prepare for ${title.replace(/ (Exam )?Preparation$/, '')} with Edexo`, ctaText: 'Tell us your target exam and level and we will suggest a suitable batch.',
    seoTitle: `${title} — Classes Online & in Delhi | Edexo`.slice(0, 70),
    seoDescription: `${title} at Edexo: reading, listening, writing and speaking practice, mock tests and exam strategies. Online and offline batches.`,
    faqs: faq([
      ['Do you provide mock tests?', 'Yes, mock tests and timed practice are part of exam preparation, along with feedback on writing and speaking.'],
      ['Can I prepare online?', 'Yes, exam preparation is available in live online classes as well as at our Delhi centres, subject to batch availability.'],
      ['Do you guarantee a result?', 'No. We help you prepare with structured practice and feedback; results depend on your performance in the official exam.'],
    ]),
  };
}

export const pages = [
  {
    slug: 'about', kind: 'page', title: 'About Edexo', subtitle: 'Professional language training for students, professionals and international learners.',
    content: `## About Edexo

Edexo is a professional language education and training platform focused on helping students and professionals develop practical language skills for education, employment, examinations and global communication.

We offer structured language programs across German and other major international languages. Our learning formats include live online classes, offline classes, group programs and one-to-one training, subject to course and batch availability.

## Our Approach

We focus on practical communication, structured progression, regular practice and goal-oriented preparation. Depending on the learner's objective, training may include speaking, listening, reading, writing, vocabulary, grammar, mock tests and exam strategies.`,
    highlightsTitle: 'Who We Serve',
    highlights: L(`
      School and college students
      University applicants
      Working professionals
      Job seekers
      International learners
      Students preparing for language examinations
      Learners preparing for study or work abroad
      Companies seeking language training for employees`),
    seoTitle: 'About Edexo — Language Training for Students & Professionals',
    seoDescription: 'Edexo is a professional language training institute offering German, French, Spanish, Japanese, Chinese and English programs online and offline in Delhi.',
  },
  {
    slug: 'language-exam-preparation', kind: 'service', groupName: 'Exams', title: 'Language Exam Preparation', sort: 0,
    subtitle: 'Prepare with structured lessons, skill practice, mock tests, exam strategies and feedback.',
    content: `## Language Exam Preparation at Edexo

Prepare with structured lessons, skill practice, mock tests, exam strategies and feedback. Preparation is aligned with the actual exam format and the learner's target.

- **German:** Goethe, TELC, ÖSD, TestDaF
- **English:** IELTS, PTE, TOEFL
- **French:** DELF, DALF, TCF
- **Spanish:** DELE, SIELE
- **Japanese:** JLPT
- **Chinese:** HSK`,
    highlightsTitle: 'Preparation includes', highlights: PREP_INCLUDES, disclaimer: EXAM_DISCLAIMER,
    ctaTitle: 'Find the right exam batch', ctaText: 'Tell us your target exam and level and we will guide you.',
    seoTitle: 'Language Exam Preparation — Goethe, IELTS, DELF, JLPT, HSK | Edexo',
    seoDescription: 'Exam preparation for Goethe, TELC, ÖSD, TestDaF, IELTS, PTE, TOEFL, DELF/DALF/TCF, DELE/SIELE, JLPT and HSK with mock tests and strategies.',
  },
  {
    slug: 'german-exam-preparation', kind: 'service', groupName: 'Exams', title: 'German Exam Preparation', sort: 1,
    subtitle: 'Goethe, TELC, ÖSD and TestDaF preparation with mock tests and feedback.',
    content: `## German Exam Preparation\n\nDepending on the active Edexo offering, preparation may include **Goethe, TELC, ÖSD and TestDaF**. Training can cover reading, listening, writing, speaking, mock tests, exam strategies, time management and feedback.\n\n- [Goethe Exam Preparation](/goethe-exam-preparation)\n- [TELC Exam Preparation](/telc-exam-preparation)\n- [ÖSD Exam Preparation](/osd-exam-preparation)\n- [TestDaF Preparation](/testdaf-preparation)`,
    highlightsTitle: 'Preparation includes', highlights: PREP_INCLUDES, disclaimer: EXAM_DISCLAIMER,
    seoTitle: 'German Exam Preparation — Goethe, TELC, ÖSD, TestDaF | Edexo',
    seoDescription: 'Prepare for Goethe, TELC, ÖSD and TestDaF German exams with Edexo — skill practice, mock tests, exam strategies and feedback.',
  },
  examPage('goethe-exam-preparation', 'Goethe Exam Preparation', 'German', 'Prepare for Goethe-Zertifikat exams from A1 to C2.', 'Goethe-Zertifikat exams are offered by the Goethe-Institut at levels A1 to C2 and assess reading, listening, writing and speaking.', 10),
  examPage('telc-exam-preparation', 'TELC Exam Preparation', 'German', 'Prepare for telc German exams.', 'telc exams are standardised German language exams aligned with the Common European Framework of Reference (CEFR) levels.', 11),
  examPage('osd-exam-preparation', 'ÖSD Exam Preparation', 'German', 'Prepare for ÖSD (Austrian Language Diploma) German exams.', 'The ÖSD (Österreichisches Sprachdiplom Deutsch) offers German exams aligned with the CEFR levels.', 12),
  examPage('testdaf-preparation', 'TestDaF Preparation', 'German', 'Prepare for TestDaF, the German test for university study.', 'TestDaF is a German language test for people planning to study at universities in Germany, testing reading, listening, writing and speaking at an advanced level.', 13),
  examPage('ielts-preparation', 'IELTS Preparation', 'English', 'Prepare for IELTS Academic and General Training.', 'IELTS assesses English listening, reading, writing and speaking and is offered in Academic and General Training versions.', 20),
  examPage('pte-preparation', 'PTE Preparation', 'English', 'Prepare for the PTE Academic English test.', 'PTE Academic is a computer-based English test that assesses speaking, writing, reading and listening.', 21),
  examPage('toefl-preparation', 'TOEFL Preparation', 'English', 'Prepare for the TOEFL English test.', 'TOEFL measures academic English reading, listening, speaking and writing skills.', 22),
  examPage('delf-dalf-tcf-preparation', 'DELF / DALF / TCF Preparation', 'French', 'Prepare for French DELF, DALF and TCF exams.', 'DELF (A1–B2) and DALF (C1–C2) are official French language diplomas; the TCF is a French language test used for study, work and immigration purposes.', 30),
  examPage('dele-siele-preparation', 'DELE / SIELE Preparation', 'Spanish', 'Prepare for Spanish DELE and SIELE exams.', 'DELE diplomas (A1–C2) are official Spanish qualifications from the Instituto Cervantes; SIELE is an online Spanish proficiency certificate.', 40),
  examPage('jlpt-preparation', 'JLPT Preparation', 'Japanese', 'Prepare for the Japanese Language Proficiency Test, N5 to N1.', 'The JLPT is offered at five levels, from N5 (basic) to N1 (advanced), and tests language knowledge, reading and listening.', 50),
  examPage('hsk-preparation', 'HSK Preparation', 'Chinese', 'Prepare for HSK Chinese proficiency exams, levels 1 to 6.', 'HSK is the standardised Chinese proficiency test, offered at multiple levels from beginner to advanced.', 60),
  {
    slug: 'online-language-classes', kind: 'service', groupName: 'Classes', title: 'Online Language Classes', sort: 0,
    subtitle: 'Learn a language online from anywhere with live instructor-led classes.',
    content: `## Learn a Language Online from Anywhere

Join live instructor-led language classes from your home, office or campus. Online learning is suitable for students in India and international learners in other countries.

**Languages:** German A1–C2, French, Spanish, Japanese N5–N1, Chinese, Arabic, Portuguese and English, subject to availability.

## How It Works

1. Choose your language
2. Select your level
3. Discuss your preferred schedule
4. Attend a free demo where available
5. Enrol and begin your classes`,
    highlightsTitle: 'Benefits',
    highlights: L(`
      Live instructor-led classes
      Flexible schedules
      Online group classes
      One-to-one options
      Exam preparation
      Structured curriculum
      Study material
      Regular assessments
      International student friendly`),
    seoTitle: 'Online Language Classes — German, French, Spanish & More | Edexo',
    seoDescription: 'Live online language classes with Edexo — German, French, Spanish, Japanese, Chinese, Arabic, Portuguese and English. Group or one-to-one, flexible schedules.',
  },
  {
    slug: 'german-online-classes', kind: 'service', groupName: 'Classes', title: 'German Online Classes', sort: 1,
    subtitle: 'Live online German classes from A1 to C2 — join from anywhere.',
    content: `## Learn German Online, Live\n\nJoin live, instructor-led German classes from A1 to C2 from anywhere in India or abroad. Choose group or one-to-one classes and timings that suit your schedule.\n\nSee all [German levels and fees](/german-language-course).`,
    highlightsTitle: 'Why learn German online with Edexo',
    highlights: L(`
      Live classes with a trainer
      A1 to C2 levels
      Group and one-to-one options
      Exam preparation
      Flexible timings for students abroad
      Free demo class`),
    seoTitle: 'German Online Classes A1–C2 — Live & Interactive | Edexo',
    seoDescription: 'Live online German classes from A1 to C2 with Edexo. Group or one-to-one, exam preparation and flexible timings for students in India and abroad.',
  },
  {
    slug: 'one-to-one-language-classes', kind: 'service', groupName: 'Classes', title: 'One-to-One Language Classes', sort: 2,
    subtitle: 'Personalized language training with individual attention.',
    content: `## Personalized Language Training\n\nOne-to-one classes provide individual attention and can be tailored around the learner's level, goals, schedule and exam requirements. Suitable for students, professionals, international learners and study-abroad/Ausbildung candidates.`,
    highlightsTitle: 'What you get',
    highlights: L(`
      Personalized lesson planning
      Flexible scheduling
      Speaking-focused practice
      Exam-oriented preparation
      Individual feedback
      Suitable for students and professionals
      Online and offline subject to availability`),
    ctaTitle: 'Request a One-to-One Demo', ctaText: 'Tell us your language, level and preferred timing.',
    seoTitle: 'One-to-One Language Classes — Personal Trainer, Flexible Timing | Edexo',
    seoDescription: 'Personalized one-to-one language classes with Edexo — flexible scheduling, speaking practice and exam-focused preparation, online or offline.',
  },
  {
    slug: 'group-language-classes', kind: 'service', groupName: 'Classes', title: 'Group Language Classes', sort: 3,
    subtitle: 'Learn together. Practice together.',
    content: `## Learn Together. Practice Together.\n\nGroup classes provide structured learning with peer interaction, speaking practice and a planned curriculum, through online and offline batches subject to availability.`,
    highlightsTitle: 'Group class benefits',
    highlights: L(`
      Interactive classroom
      Peer speaking practice
      Structured lessons
      Regular practice
      Exam preparation where offered
      Online/offline batches subject to availability`),
    seoTitle: 'Group Language Classes — Online & Offline Batches | Edexo',
    seoDescription: 'Interactive group language classes with Edexo — peer speaking practice, structured curriculum and exam preparation in online and offline batches.',
  },
  {
    slug: 'corporate-language-training', kind: 'service', groupName: 'Classes', title: 'Corporate Language Training', sort: 4,
    subtitle: 'Language training for companies and teams.',
    content: `## Language Training for Companies & Teams\n\nEdexo can design language training around business goals, employee roles, industry requirements and communication needs.\n\n**Programs:** Business German, Business English, French, Spanish, Japanese and other languages subject to availability.\n\n**Formats:** online, on-site, group and one-to-one training, depending on requirements.\n\n## Process\n\nRequirement discussion → Level assessment → Program design → Training schedule → Progress review → Completion/assessment.`,
    highlightsTitle: 'Programs',
    highlights: L(`
      Business German
      Business English
      French
      Spanish
      Japanese
      Other languages subject to availability`),
    ctaTitle: 'Plan training for your team', ctaText: 'Share your team size, language and goals and we will get in touch.',
    seoTitle: 'Corporate Language Training — Business German & English | Edexo',
    seoDescription: 'Customized corporate language training — Business German, Business English, French, Spanish and Japanese — online, on-site, group or one-to-one.',
  },
  {
    slug: 'study-in-germany', kind: 'service', groupName: 'Abroad', title: 'Study in Germany', sort: 0,
    subtitle: 'German language preparation for students planning to study in Germany.',
    content: `## Study in Germany\n\nPrepare for German-language requirements and academic communication through structured German learning and relevant exam preparation.\n\nExplore our [German A1–C2 program](/german-language-course) and [German exam preparation](/german-exam-preparation).`,
    highlightsTitle: 'How we help',
    highlights: L(`
      German A1 to C2 training
      Academic communication
      Relevant exam preparation
      Online and offline classes`),
    disclaimer: 'Edexo provides language training and guidance but does not guarantee university admission or visa approval. Final decisions rest with the relevant institution or authority.',
    ctaTitle: 'Talk to an Edexo Counsellor', ctaText: 'Tell us your plans and current German level.',
    seoTitle: 'Study in Germany — German Language Preparation | Edexo',
    seoDescription: 'Planning to study in Germany? Build your German from A1 to C2 and prepare for relevant German exams with Edexo, online or in Delhi.',
  },
  {
    slug: 'ausbildung-germany', kind: 'service', groupName: 'Abroad', title: 'Ausbildung Germany', sort: 1,
    subtitle: 'German language preparation for Ausbildung (vocational training) in Germany.',
    content: `## Ausbildung Germany\n\nDevelop German communication skills required for daily life, workplace interaction and relevant examination preparation. Eligibility and selection depend on the specific program and employer.`,
    highlightsTitle: 'Training focus',
    highlights: L(`
      German language progression
      Speaking practice
      Exam preparation
      Workplace communication`),
    disclaimer: 'Edexo provides language training and guidance but does not guarantee Ausbildung placement, employment or visa approval. Eligibility varies by program and employer.',
    ctaTitle: 'Talk to an Edexo Counsellor', ctaText: 'Tell us about your Ausbildung plans and current German level.',
    seoTitle: 'Ausbildung Germany — German Language Preparation | Edexo',
    seoDescription: 'German language preparation for Ausbildung in Germany — language progression, speaking practice, exam preparation and workplace communication.',
  },
  {
    slug: 'german-for-work', kind: 'service', groupName: 'Abroad', title: 'German for Work', sort: 2,
    subtitle: 'Workplace German for professionals.',
    content: `## German for Work\n\nLearn workplace vocabulary, meetings, presentations, emails, interviews, client communication and professional interaction.`,
    highlightsTitle: 'You will practise',
    highlights: L(`
      Workplace vocabulary
      Meetings and presentations
      Emails
      Client interaction
      Interviews
      Industry-focused communication`),
    disclaimer: 'Language training does not guarantee employment or visa approval.',
    seoTitle: 'German for Work — Workplace & Business German | Edexo',
    seoDescription: 'Workplace German with Edexo — meetings, presentations, emails, interviews and client communication for professionals.',
  },
  {
    slug: 'international-students', kind: 'service', groupName: 'Abroad', title: 'International Students', sort: 3,
    subtitle: 'Learn with Edexo from anywhere in the world.',
    content: `## Learn with Edexo from Anywhere in the World\n\nAre you outside India? Join Edexo's live online language classes from anywhere in the world. Our online programs support international learners who want to learn German or another language without relocating for classes. Coordinate classes around your time zone.`,
    highlightsTitle: 'Built for international learners',
    highlights: L(`
      Country-code enabled WhatsApp
      Country selector
      Preferred time zone
      Preferred class timing
      Online group and one-to-one options
      International enquiry support`),
    ctaTitle: 'International Student Enquiry', ctaText: 'Tell us your country, time zone and preferred class timing.',
    seoTitle: 'Online Language Classes for International Students | Edexo',
    seoDescription: 'Outside India? Join Edexo live online German and other language classes from anywhere, with timings that suit your time zone.',
  },
  {
    slug: 'franchise', kind: 'special', title: 'Franchise', subtitle: 'Start your own language training centre with Edexo.',
    content: `## Start Your Own Language Training Centre with Edexo\n\nBuild a professional language education business with support in branding, academic structure, marketing, operations and technology, subject to the final franchise model.`,
    highlightsTitle: 'Franchise support',
    highlights: L(`
      Brand & Marketing Support
      Academic & Curriculum Guidance
      Business & Operational Guidance
      Technology & Lead Management Support
      Digital Marketing Guidance
      Growth & Local Marketing Guidance`),
    ctaTitle: 'Who can apply?', ctaText: 'Education entrepreneurs, existing coaching institutes, language trainers, education professionals, consultants and suitable business partners/investors.',
    showEnquiry: false,
    seoTitle: 'Edexo Franchise — Start a Language Training Centre',
    seoDescription: 'Partner with Edexo to start a language training centre — brand, academic, operational, technology and marketing support. Send a franchise enquiry.',
  },
  {
    slug: 'careers', kind: 'special', title: 'Careers', subtitle: 'Build your career with Edexo.',
    content: `## Build Your Career with Edexo\n\nJoin a professional language education organisation and help students build their language skills and global opportunities.`,
    highlightsTitle: 'What we look for in trainers',
    highlights: L(`
      Strong language proficiency
      Relevant teaching experience
      Good communication skills
      Student-focused teaching
      Ability to conduct interactive classes
      Relevant qualification/certification where applicable`),
    showEnquiry: false,
    seoTitle: 'Careers at Edexo — Language Trainer & Counsellor Jobs',
    seoDescription: 'Join Edexo — openings for language trainers, counsellors and more. Apply online with your CV.',
  },
  {
    slug: 'privacy-policy', kind: 'legal', title: 'Privacy Policy', subtitle: '',
    content: `## Privacy Policy\n\nThis policy explains how Edexo collects and uses personal information submitted through this website.\n\n## Information we collect\n\nWhen you fill in an enquiry, demo, franchise or job application form we collect the details you provide, such as your name, phone/WhatsApp number, email, country, course interests, preferred timing, message and — for job applications — your CV.\n\n## How we use it\n\nWe use this information to respond to your enquiry, contact you about courses, demos and admissions, process franchise enquiries and job applications, and improve our services.\n\n## Cookies and analytics\n\nThis website may use cookies and analytics/advertising tools (such as Google Analytics, Google Ads and Meta Pixel) to understand website usage and measure enquiries. See our [Cookie Policy](/cookie-policy).\n\n## Sharing and protection\n\nWe do not sell your personal information. Access to enquiry data is limited to Edexo staff who need it, and we take reasonable measures to protect it.\n\n## Your choices\n\nYou can ask us to update or delete your information, or to stop contacting you, by using the contact details on our [Contact](/contact) page.\n\n## Changes\n\nWe may update this policy from time to time. The latest version will always be available on this page.`,
    showEnquiry: false, seoTitle: 'Privacy Policy | Edexo', seoDescription: 'How Edexo collects, uses and protects personal information submitted through this website.',
  },
  {
    slug: 'terms-and-conditions', oldSlug: 'terms-of-use', kind: 'legal', title: 'Terms & Conditions', subtitle: '',
    content: `## Terms & Conditions\n\nBy using this website and enrolling in Edexo courses you agree to the following terms.\n\n## Courses and availability\n\nCourse levels, formats (online/offline, group/one-to-one), schedules and trainers are offered subject to batch availability and may change. Course details on this website are for information and may be updated.\n\n## Registration and fees\n\nEnrolment is confirmed after registration and payment of the applicable fee. Fees shown on this website may be revised; the fee confirmed at the time of enrolment applies. Refunds, cancellations and batch changes are governed by our [Refund & Cancellation Policy](/refund-policy).\n\n## Online learning\n\nStudents are responsible for a suitable device and internet connection for online classes. Class links and recordings (if any) are for enrolled students only and must not be shared.\n\n## Intellectual property\n\nStudy material, content and branding provided by Edexo are for personal learning use and may not be copied or distributed without permission.\n\n## Acceptable use\n\nStudents are expected to behave respectfully towards trainers and other learners. Edexo may remove participants who disrupt classes.\n\n## Study and work abroad\n\nEdexo provides language training and guidance only and does not guarantee examination results, university admission, employment, Ausbildung placement, visa approval or immigration outcomes.\n\n## Changes\n\nEdexo may update these terms from time to time.`,
    showEnquiry: false, seoTitle: 'Terms & Conditions | Edexo', seoDescription: 'Terms and conditions for using the Edexo website and enrolling in Edexo language courses.',
  },
  {
    slug: 'refund-policy', kind: 'legal', title: 'Refund & Cancellation Policy', subtitle: '',
    content: `## Refund & Cancellation Policy\n\nFor questions about refunds, cancellations, batch transfers, postponements or exam-related fees, please contact our team using the details on our [Contact](/contact) page before making any change to your enrolment.\n\nOur detailed refund and cancellation rules are confirmed at the time of enrolment and will be published on this page.`,
    showEnquiry: false, seoTitle: 'Refund & Cancellation Policy | Edexo', seoDescription: 'Information about refunds, cancellations, transfers and batch changes for Edexo courses.',
  },
  {
    slug: 'disclaimer', kind: 'legal', title: 'Disclaimer', subtitle: '',
    content: `## Disclaimer\n\nCourse information, fees, durations, schedules and availability shown on this website may change and should be confirmed with Edexo before enrolment.\n\nEdexo does not guarantee examination results, university admission, employment, Ausbildung placement, visa approval or immigration outcomes. Final decisions rest with the relevant institution, employer or authority.\n\nExam names mentioned on this website are the property of their respective owners; Edexo provides independent preparation.`,
    showEnquiry: false, seoTitle: 'Disclaimer | Edexo', seoDescription: 'Disclaimer about course information, exam preparation and study/work abroad outcomes at Edexo.',
  },
  {
    slug: 'cookie-policy', kind: 'legal', title: 'Cookie Policy', subtitle: '',
    content: `## Cookie Policy\n\nCookies are small files stored on your device when you visit a website.\n\n## Cookies we use\n\n- **Essential cookies** — needed for the website to work, for example to keep administrators signed in.\n- **Analytics cookies** — help us understand how visitors use the website (for example Google Analytics).\n- **Marketing cookies** — help us measure the results of our advertising (for example Google Ads and Meta Pixel).\n\n## Managing cookies\n\nYou can block or delete cookies in your browser settings. Blocking some cookies may affect how the website works.`,
    showEnquiry: false, seoTitle: 'Cookie Policy | Edexo', seoDescription: 'How the Edexo website uses essential, analytics and marketing cookies and how you can manage them.',
  },
];

/* ---------- global FAQs ---------- */
export const faqs = [
  ['General', true, 'How can I join Edexo language classes?', 'Book a free demo or send an enquiry with your language and level. Our team will contact you on WhatsApp or phone to suggest a suitable batch and format.'],
  ['General', true, 'Do you offer online classes?', 'Yes. We run live, instructor-led online classes that you can join from anywhere, as well as offline classes at our Rohini and Dwarka centres in Delhi, subject to batch availability.'],
  ['General', true, 'Which level should I start with?', 'If you are new to a language, start at the beginner level (for example A1, N5, HSK 1 or TOPIK 1). If you have studied before, our team can help you find the right level before you join.'],
  ['General', true, 'Do you provide exam preparation?', 'Yes, exam preparation is available for selected exams — see the Exam Preparation section or ask our team about current batches.'],
  ['General', true, 'Do you offer one-to-one classes?', 'Yes, one-to-one classes are available online and offline, subject to trainer availability.'],
  ['General', true, 'How long does a course take?', 'It depends on the language and level. Durations for each program are listed on the Courses & Fees page — many levels run for about 3 to 6 months.'],
  ['General', true, 'How can international students join?', 'Students outside India can join our live online classes. Send an International Student Enquiry with your country, time zone and preferred timing.'],
  ['General', true, 'How can I book a free demo?', 'Use the Book Free Demo button or the enquiry form on this website, or message us on WhatsApp.'],
  ['Course', false, 'What are the course fees?', 'Fees for every language and level are listed on our Courses & Fees page. German fees are the same for online and offline classes.'],
  ['Study Abroad', false, 'Do you guarantee visa or admission?', 'No. Edexo provides language training and guidance. University admission, visa, employment and Ausbildung decisions are made by the relevant institutions, employers and authorities.'],
  ['Study Abroad', false, 'Do you provide Ausbildung language preparation?', 'Yes, our German programs and exam preparation help learners build the language skills needed for Ausbildung. Eligibility depends on the specific program and employer.'],
];

/* ---------- job openings (inactive until Edexo confirms) ---------- */
export const jobs = [
  ['German Language Trainer', 'Academics'], ['French Language Trainer', 'Academics'], ['Spanish Language Trainer', 'Academics'],
  ['Japanese Language Trainer', 'Academics'], ['English Communication Trainer', 'Academics'], ['Academic Counsellor', 'Counselling'],
  ['Business Development Executive', 'Sales'], ['Digital Marketing Executive', 'Marketing'], ['Centre Manager', 'Operations'], ['Student Counsellor', 'Counselling'],
];

/* ---------- why choose / features ---------- */
export const reasons = [
  ['Experienced & Qualified Trainers', 'Learn from trainers with strong language proficiency and teaching experience.', 'users', 'navy'],
  ['Live Online & Offline Learning', 'Join live online classes or learn at our Rohini and Dwarka centres.', 'laptop', 'orange'],
  ['Beginner to Advanced Levels', 'Structured pathways from A1 / N5 / HSK 1 up to advanced levels.', 'layers', 'green'],
  ['One-to-One & Group Classes', 'Choose personal attention or interactive group batches.', 'user', 'blue'],
  ['Exam Preparation', 'Skill practice, mock tests and exam strategies for international exams.', 'target', 'amber'],
  ['Structured Curriculum', 'A planned syllabus covering speaking, listening, reading and writing.', 'listChecks', 'navy'],
  ['Study Material', 'Learning material and practice resources for every level.', 'book', 'orange'],
  ['Regular Assessments', 'Regular practice, tests and feedback to track your progress.', 'checkCircle', 'green'],
  ['Flexible Learning Options', 'Weekday and weekend batches with timings that suit you.', 'clock', 'blue'],
  ['International Student Support', 'Live online classes at times that suit your time zone.', 'globe', 'amber'],
  ['Study & Work Abroad Language Guidance', 'Language preparation for study, work and Ausbildung abroad.', 'plane', 'navy'],
];
export const features = [
  ['A1–C2 Levels', 'layers', 'navy'], ['Online & Offline', 'laptop', 'green'], ['Exam Preparation', 'target', 'amber'], ['One-to-One & Group', 'users', 'blue'],
];

/* ---------- menus: [location, label, href, children?] ---------- */
export const menus = [
  ['header', 'Home', '/'],
  ['header', 'About Us', '/about'],
  ['header', 'Language Programs', '/courses', [
    ['German A1–C2', '/german-language-course'], ['French', '/french-language-course'], ['Spanish', '/spanish-language-course'],
    ['Japanese N5–N1', '/japanese-language-course'], ['Chinese', '/chinese-language-course'], ['Arabic', '/arabic-language-course'],
    ['Portuguese', '/portuguese-language-course'], ['English & Communication', '/spoken-english-course'], ['Italian', '/italian-language-course'],
    ['Korean', '/korean-language-course'], ['Russian', '/russian-language-course'], ['German for Kids', '/german-for-kids'], ['French for Kids', '/french-for-kids'],
    ['All Courses & Fees', '/courses'],
  ]],
  ['header', 'Exam Preparation', '/language-exam-preparation', [
    ['Goethe', '/goethe-exam-preparation'], ['TELC', '/telc-exam-preparation'], ['ÖSD', '/osd-exam-preparation'], ['TestDaF', '/testdaf-preparation'],
    ['IELTS', '/ielts-preparation'], ['PTE', '/pte-preparation'], ['TOEFL', '/toefl-preparation'], ['DELF / DALF / TCF', '/delf-dalf-tcf-preparation'],
    ['DELE / SIELE', '/dele-siele-preparation'], ['JLPT', '/jlpt-preparation'], ['HSK', '/hsk-preparation'],
  ]],
  ['header', 'Online Classes', '/online-language-classes', [
    ['Online Language Classes', '/online-language-classes'], ['German Online Classes', '/german-online-classes'], ['One-to-One Classes', '/one-to-one-language-classes'],
    ['Group Classes', '/group-language-classes'], ['Corporate Training', '/corporate-language-training'],
  ]],
  ['header', 'Study & Work Abroad', '/study-in-germany', [
    ['Study in Germany', '/study-in-germany'], ['Ausbildung Germany', '/ausbildung-germany'], ['German for Work', '/german-for-work'], ['International Students', '/international-students'],
  ]],
  ['header', 'Franchise', '/franchise'],
  ['header', 'Careers', '/careers'],
  ['header', 'Blog', '/blog'],
  ['header', 'Contact Us', '/contact'],
  ['footer_useful', 'Home', '/'], ['footer_useful', 'About Us', '/about'], ['footer_useful', 'Language Programs', '/courses'],
  ['footer_useful', 'Exam Preparation', '/language-exam-preparation'], ['footer_useful', 'Online Classes', '/online-language-classes'],
  ['footer_useful', 'Study & Work Abroad', '/study-in-germany'], ['footer_useful', 'Franchise', '/franchise'], ['footer_useful', 'Careers', '/careers'],
  ['footer_useful', 'Blog', '/blog'], ['footer_useful', 'Contact', '/contact'],
  ['footer_courses', 'German', '/german-language-course'], ['footer_courses', 'French', '/french-language-course'], ['footer_courses', 'Spanish', '/spanish-language-course'],
  ['footer_courses', 'Japanese', '/japanese-language-course'], ['footer_courses', 'Chinese', '/chinese-language-course'], ['footer_courses', 'English', '/spoken-english-course'],
  ['footer_courses', 'German Classes in Mumbai', '/german-language-courses-classes-mumbai'], ['footer_courses', 'German Classes in Pune', '/german-classes-in-pune'],
  ['footer_courses', 'German Classes in Jaipur', '/german-language-classes-in-jaipur'],
  ['footer_support', 'FAQs', '/faqs'], ['footer_support', 'Contact', '/contact'], ['footer_support', 'Privacy Policy', '/privacy-policy'],
  ['footer_support', 'Terms & Conditions', '/terms-and-conditions'], ['footer_support', 'Refund Policy', '/refund-policy'],
  ['footer_support', 'Disclaimer', '/disclaimer'], ['footer_support', 'Cookie Policy', '/cookie-policy'],
];

/* ---------- settings ---------- */
export const settings = {
  heroEyebrow: 'A1–C2 • Online & Offline • Exam Preparation • One-to-One & Group Classes',
  heroTitle: 'Learn Languages.', heroHighlight: 'Build Your Global Future.',
  heroText: 'Master German, French, Spanish, Japanese, Chinese and English with structured language programs designed for students, professionals and international learners.',
  heroSubtext: 'Whether your goal is education, career growth, international communication, examination preparation or learning a new language, Edexo provides structured learning options around your goals.',
  heroPrimaryLabel: 'Book Free Demo', heroPrimaryHref: '#enquiry',
  heroWhatsappLabel: 'WhatsApp Us',
  heroSecondaryLabel: 'Explore Courses', heroSecondaryHref: '/courses',
  heroBadgesLeft: 'Online & Offline Classes\nOne-to-One & Group', heroBadgesRight: 'Free Demo Class\nExam Preparation',
  headerCtaLabel: 'Book Free Demo', headerCtaHref: '/contact?type=demo#enquiry',
  programsEyebrow: 'Language Programs', programsTitle: 'Popular Language Programs', programsText: 'Choose a language and level — online or offline, in a group or one-to-one.',
  aboutEyebrow: 'About Edexo', aboutTitle: 'Why Choose Edexo?',
  aboutText: 'Edexo is a professional language training institute offering structured language programs for students, professionals and international learners, through online and offline formats with group and one-to-one options.',
  germanEyebrow: 'German A1–C2', germanTitle: 'Learn German from A1 to C2', germanText: 'Structured German programs for study, work, exams and everyday communication. Same fees online and offline.',
  examsEyebrow: 'Exam Preparation', examsTitle: 'Prepare for International Language Exams', examsText: 'Structured lessons, skill practice, mock tests, exam strategies and feedback.',
  onlineEyebrow: 'Online Classes', classesTitle: 'One-to-One & Group Classes',
  abroadEyebrow: 'Study & Work Abroad', abroadTitle: 'Study & Work in Germany', abroadText: 'Planning to study, work or pursue an Ausbildung opportunity in Germany? Build the language skills needed for communication, examinations and professional environments.',
  abroadDisclaimer: 'Language training does not guarantee admission, employment, Ausbildung placement or visa approval.',
  intlTitle: 'Are you outside India?', intlText: "Join Edexo's live online language classes from anywhere in the world, at timings that suit your time zone.", intlButton: 'International Student Enquiry',
  testimonialsEyebrow: 'Student Reviews', testimonialsTitle: 'What Our Students Say',
  faqsEyebrow: 'FAQs', faqsTitle: 'Frequently Asked Questions',
  enquiryTitle: 'Ready to Start Your Language Journey?', enquiryText: 'Choose your language. Choose your goal. Start your journey with Edexo.',
  enquiryPoints: 'Free demo class\nOnline & offline batches\nGroup & one-to-one options', enquiryButton: 'Book Free Demo',
  enquirySuccess: 'Thank you! Our team will contact you shortly on WhatsApp or phone.',
  contactTitle: 'Start Your Language Learning Journey', contactText: 'Tell us your language, current level and goal. Our team can guide you toward a suitable course and learning format.',
  coursesTitle: 'Choose Your Language. Choose Your Level. Start Learning.',
  coursesText: 'Explore Edexo language programs for students, professionals and learners. Online and offline learning options are available according to the program and batch.',
  footerAbout: 'Professional language training for students, professionals and international learners.',
  copyright: '© {year} Edexo. All Rights Reserved.',
  footerUsefulTitle: 'Quick Links', footerCoursesTitle: 'Popular Programs', footerSupportTitle: 'Support', footerLocationsTitle: 'Contact',
  seoTitle: 'Edexo – German & Foreign Language Courses | Online & Offline Classes',
  seoDescription: 'Learn German, French, Spanish, Japanese, Chinese & English with Edexo. A1–C2 courses, exam preparation, online classes, one-to-one training and study/work abroad guidance.',
  coursesSeoTitle: 'Courses & Fees — German, French, Spanish, Japanese & More | Edexo',
  coursesSeoDescription: 'Course fees for German A1–C2, German & French for Kids, Italian, Chinese HSK, Japanese JLPT, Spanish, Korean TOPIK, Arabic and Russian — online and offline.',
  showPrograms: true, showWhy: true, showGerman: true, showExams: true, showOnline: true, showClasses: true, showAbroad: true, showInternational: true,
  showTestimonials: true, showStats: true, showFaqs: true, showFeatures: true, showLevels: false, showBlog: false, showBranches: false,
};

/* ---------- URL changes → redirects ---------- */
export const redirects = [
  ['/german-language', '/german-language-course'], ['/french-language', '/french-language-course'], ['/terms-of-use', '/terms-and-conditions'],
  ['/japanese', '/japanese-language-course'], ['/italian', '/italian-language-course'], ['/korean', '/korean-language-course'],
  ['/chinese', '/chinese-language-course'], ['/spanish', '/spanish-language-course'], ['/russian', '/russian-language-course'], ['/arabic', '/arabic-language-course'],
  ['/foreign-language', '/courses'], ['/german-language-classes-a1-c2', '/german-language-course'], ['/german-course-highlights', '/german-language-course'],
  ['/french-language-classes-a1-level-c2-level', '/french-language-course'], ['/course/japanese-language-classes', '/japanese-language-course'],
  ['/course/italian-language-course', '/italian-language-course'], ['/enroll-now', '/contact?type=demo'], ['/register-now', '/contact?type=demo'],
  // first version of this site used /courses/<slug>
  ...['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].flatMap((l) => [[`/courses/german-${l}`, `/german-${l}-course`], [`/german-${l}`, `/german-${l}-course`]]),
  ['/courses/french-a1', '/french-a1-course'], ['/french-a1', '/french-a1-course'],
  ['/courses/italian', '/italian-language-course'], ['/courses/japanese', '/japanese-language-course'],
];
