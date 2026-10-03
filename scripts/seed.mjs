// Seeds Edexo content on first start (only when the settings row does not exist yet)
// and makes sure an admin user exists. Safe to run on every start.
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';

const url = process.env.DATABASE_URL;
if (!url) { console.error('[seed] DATABASE_URL is not set'); process.exit(1); }
const client = new pg.Client({ connectionString: url });
await client.connect();

const IMG_DIR = path.join(process.cwd(), 'seed', 'images');

async function addImage(file, alt = '') {
  const buf = fs.readFileSync(path.join(IMG_DIR, file));
  const meta = await sharp(buf).metadata();
  const mime = meta.format === 'png' ? 'image/png' : 'image/jpeg';
  const { rows } = await client.query(
    'insert into media (filename, mime, width, height, size, alt, data) values ($1,$2,$3,$4,$5,$6,$7) returning id',
    [file, mime, meta.width, meta.height, buf.length, alt, buf],
  );
  return rows[0].id;
}

async function insert(table, row) {
  const keys = Object.keys(row);
  const { rows } = await client.query(
    `insert into ${table} (${keys.map((k) => `"${k}"`).join(',')}) values (${keys.map((_, i) => `$${i + 1}`).join(',')}) returning id`,
    keys.map((k) => row[k]),
  );
  return rows[0].id;
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@edexo.in').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const { rows } = await client.query('select id from admin_users limit 1');
  if (rows.length) return;
  if (!password) {
    console.warn('[seed] No admin user and ADMIN_PASSWORD not set — skipping admin creation');
    return;
  }
  await insert('admin_users', { email, name: 'Admin', password_hash: await bcrypt.hash(password, 12) });
  console.log(`[seed] created admin user ${email}`);
}

async function seedContent() {
  const { rows } = await client.query('select id from settings where id = 1');
  if (rows.length) { console.log('[seed] content already present'); return; }
  console.log('[seed] seeding Edexo content…');
  await client.query('begin');
  try {
    const img = {
      logo: await addImage('logo.png', 'Edexo'),
      logoWhite: await addImage('logo-white.png', 'Edexo'),
      favicon: await addImage('logo-round.png', 'Edexo'),
      hero: await addImage('hero-student-warm.jpg', 'Smiling Edexo student'),
      c2: await addImage('course-2.jpg', 'Student waving in an online class'),
      c3: await addImage('course-3.jpg', 'Student in a live video lesson'),
      c4: await addImage('course-4.jpg', 'Learner joining a group video class'),
      c5: await addImage('course-5.jpg', 'Student with German flag at a laptop'),
      c6: await addImage('course-6.jpg', 'Online lesson with a teacher on screen'),
      b1: await addImage('blog-1.jpg', 'Student studying with a tablet and laptop'),
      b2: await addImage('blog-2.jpg', 'Trainer teaching an online class'),
      t1: await addImage('testimonial-1.jpg', 'Student'),
    };

    const settings = {
      siteName: 'Edexo',
      tagline: 'German Language Institute in Delhi',
      logoId: img.logo, logoWhiteId: img.logoWhite, faviconId: img.favicon,
      primaryPhone: '+91 99537 74123',
      whatsapp: '919953774123',
      email: '',
      facebook: '#', instagram: '#', youtube: '', linkedin: '',
      topbarItems: 'Rohini: +91 99537 74123\nDwarka: +91 99114 64123',
      headerCtaLabel: 'Enroll Now', headerCtaHref: '/#enroll',
      signInLabel: 'Sign In', signInHref: '',
      heroEyebrow: 'German Language Institute · Delhi',
      heroTitle: 'Join the Best German Language Course,',
      heroHighlight: 'from Beginner to C1',
      heroText: 'Practical, personalised German classes from A1 to C2, online or at our Rohini and Dwarka centres. We also offer exam preparation and guidance for studying or working in Germany.',
      heroPrimaryLabel: 'Book a Free Demo', heroPrimaryHref: '/#enroll',
      heroSecondaryLabel: 'View Courses', heroSecondaryHref: '/courses',
      heroImageId: img.hero,
      heroBadgesLeft: 'Online & Offline Classes\nExpert Trainers',
      heroBadgesRight: 'Free Demo Class\nExam Preparation',
      heroStatValue: '7+ Years', heroStatLabel: 'Teaching Experience',
      coursesEyebrow: 'Our Courses',
      coursesTitle: 'Choose Your Language',
      coursesText: 'German is our speciality, with every level from A1 to C2. We also teach French, Italian and Japanese — all with free demo classes and certification.',
      aboutEyebrow: 'About Edexo',
      aboutTitle: 'Why Learn German With Us?',
      aboutText: 'We offer practical, personalised German instruction from beginner to advanced level, built around your exam, your career and your plans for Germany.',
      aboutImageId: img.b2, aboutBadgeValue: '7+', aboutBadgeLabel: 'YEARS EXPERIENCE',
      levelsEyebrow: 'Course Levels',
      levelsTitle: 'Your Path From A1 to C2',
      levelsText: 'Start at the level that fits you. Our trainers assess you in the free demo and recommend where to begin.',
      enquiryTitle: 'Learn German A1–B2 & Start Your Germany Journey',
      enquiryText: 'Book a free demo class. Our counsellor will call you to schedule it.',
      enquiryPoints: 'Free demo class\nCertification on completion\nExpert trainers',
      enquiryButton: 'Book My Free Demo',
      enquirySuccess: 'Thank you! Our counsellor will call you shortly to schedule your free demo.',
      testimonialsEyebrow: 'Testimonials', testimonialsTitle: 'What Our Students Say',
      blogEyebrow: 'News & Blog', blogTitle: 'Latest Articles',
      branchesTitle: 'Visit Our Centres',
      footerAbout: 'A German language institute in Delhi offering online and offline courses from A1 to C2, with exam preparation.',
      footerUsefulTitle: 'Useful Links', footerCoursesTitle: 'Courses',
      newsletterTitle: 'Stay Connected', newsletterText: 'Leave your phone number and we will call you back.',
      copyright: 'Copyright © {year} Edexo. All Rights Reserved.',
      showFeatures: true, showLevels: true, showTestimonials: true, showStats: true, showBlog: true, showBranches: true,
      showWhatsappButton: true,
      seoTitle: 'Edexo — Best German Language Institute in Delhi | A1 to C2',
      seoDescription: 'Learn German from A1 to C2 at Edexo, Rohini and Dwarka, Delhi. Online and offline classes, exam preparation, free demo class and expert trainers.',
      ogImageId: img.hero, gtmId: 'GTM-K3XJPMCS',
    };
    await client.query('insert into settings (id, data) values (1, $1)', [JSON.stringify(settings)]);

    const langs = {};
    for (const [i, l] of [
      ['German', 'german', 'DE', 'Every level from A1 to C2, with exam preparation.'],
      ['French', 'french', 'FR', 'Beginner French with pronunciation and everyday phrases.'],
      ['Italian', 'italian', 'IT', 'Italian from the ground up, with conversation practice.'],
      ['Japanese', 'japanese', 'JP', 'Hiragana, katakana, basic kanji and spoken Japanese.'],
    ].entries()) {
      langs[l[1]] = await insert('languages', { name: l[0], slug: l[1], code: l[2], intro: l[3], sort: i });
    }

    const courseRows = [
      ['german', 'German A1', 'german-a1', 'A1', 16499, 20000, '2 months', img.c5, 'Start from zero: alphabet, greetings and everyday conversation.'],
      ['german', 'German A2', 'german-a2', 'A2', 17499, 21500, '2 months', img.c4, 'Build on the basics with everyday situations and simple writing.'],
      ['german', 'German B1', 'german-b1', 'B1', 18499, 23000, '3 months', img.c3, 'Independent use for work, travel and visa requirements.'],
      ['german', 'German B2', 'german-b2', 'B2', 29499, 32000, '3 months', img.c6, 'Confident, fluent German for university and jobs.'],
      ['german', 'German C1', 'german-c1', 'C1', 31499, 36000, '3 months', img.c2, 'Advanced German for academic and professional settings.'],
      ['german', 'German C2', 'german-c2', 'C2', 32499, 37500, '3 months', img.b1, 'Near-native proficiency, including complex texts.'],
      ['french', 'French A1', 'french-a1', 'A1', 19999, 24999, '2 months', img.b2, 'Beginner French: pronunciation, basics and everyday phrases.'],
      ['italian', 'Italian', 'italian', 'Beginner', 25000, 35000, '6 months', img.c6, 'Italian from the ground up, with conversation practice.'],
      ['japanese', 'Japanese', 'japanese', 'Beginner', 45000, null, '6 months', img.c3, 'Hiragana, katakana, basic kanji and spoken Japanese.'],
    ];
    for (const [i, c] of courseRows.entries()) {
      await insert('courses', {
        language_id: langs[c[0]], title: c[1], slug: c[2], level: c[3], price: c[4], mrp: c[5], duration: c[6],
        image_id: c[7], short_desc: c[8],
        description: `## About this course\n\n${c[8]}\n\nClasses are available online and at our Rohini and Dwarka centres. Every course starts with a free demo class so you can meet your trainer before you enrol.`,
        highlights: 'Free demo class\nOnline or offline batches\nStudy material included\nCertificate on completion',
        featured: i < 3, sort: i, mode: 'Online / Offline',
      });
    }

    for (const [i, f] of [
      ['Online & Offline', 'laptop', 'navy'], ['A1 to C2 Levels', 'book', 'green'],
      ['Exam Preparation', 'award', 'amber'], ['Rohini & Dwarka', 'pin', 'blue'],
    ].entries()) await insert('features', { title: f[0], icon: f[1], tone: f[2], sort: i });

    for (const [i, r] of [
      ['Career Opportunities', "Open doors in Europe's largest economy.", 'briefcase', 'orange'],
      ['Affordable Universities', 'Study in Germany at low or no tuition.', 'cap', 'green'],
      ['Travel With Ease', 'Get around Germany, Austria and Switzerland.', 'plane', 'amber'],
      ['Cultural Immersion', 'Understand the films, books and people.', 'globe', 'blue'],
    ].entries()) await insert('reasons', { title: r[0], description: r[1], icon: r[2], tone: r[3], sort: i });

    for (const [i, l] of [
      ['A1', 'Beginner', 'Everyday basics: greetings, numbers and simple conversations.', 'View Course', '/courses/german-a1', false],
      ['A2 · B1 · B2', 'Intermediate', 'Confident conversation, reading and writing for visas and university.', 'View Courses', '/courses?language=german', true],
      ['C1', 'Advanced', 'Fluent, nuanced German for work and academic study.', 'View Course', '/courses/german-c1', false],
      ['C2', 'Proficiency', 'Near-native mastery for professionals and specialists.', 'View Course', '/courses/german-c2', false],
    ].entries()) await insert('levels', { code: l[0], title: l[1], description: l[2], button_label: l[3], link: l[4], featured: l[5], sort: i });

    await insert('testimonials', {
      name: 'Edexo Student', role: 'German student',
      quote: 'One of the best language institutes for learning German. Well-structured courses, qualified teachers…',
      rating: 5, photo_id: img.t1, sort: 0,
    });

    // "Students Trained" is left hidden until the client gives the real number.
    for (const [i, s] of [
      ['7+', 'Years Experience', 'award', 'orange', true], ['9', 'Language Courses', 'book', 'green', true],
      ['0+', 'Students Trained', 'users', 'amber', false], ['2', 'Delhi Branches', 'pin', 'blue', true],
    ].entries()) await insert('stats', { value: s[0], label: s[1], icon: s[2], tone: s[3], sort: i, active: s[4] });

    const postsData = [
      ['German A1 Course in Dwarka: Learn German from Scratch', 'german-a1-course-in-dwarka', '2026-03-22', img.b1,
        'Everything you need to know about starting German A1 at our Dwarka centre.'],
      ['How to Learn German Effectively in 10 Steps', 'learn-german-effectively-in-10-steps', '2025-05-19', img.b2,
        'Ten practical habits that help you learn German faster and remember more.'],
      ['Studying in Germany, Simplified', 'studying-in-germany-simplified', '2025-06-17', img.c5,
        'A simple guide to universities, language requirements and applications in Germany.'],
    ];
    for (const p of postsData) {
      await insert('posts', {
        title: p[0], slug: p[1], published_at: new Date(p[2]), cover_id: p[3], excerpt: p[4],
        content: `${p[4]}\n\n*Full article coming soon. Edit this post from the admin panel.*`,
      });
    }

    for (const [i, b] of [
      ['Rohini', 'A-1/1, Outer Ring Road, Prashant Vihar, Sector 14, Rohini, New Delhi – 110085',
        'Near Uttari Pitampura, Prashant Vihar & Madhuban Chowk metro', '+91 99537 74123\n+91 99999 04123'],
      ['Dwarka', 'Plot No 112, Sewak Park, Azad Hind Fauz Marg, Dwarka Mor, New Delhi – 110059',
        'Near Dwarka Mor metro', '+91 99114 64123\n+91 97113 84123'],
    ].entries()) await insert('branches', { name: b[0], address: b[1], landmark: b[2], phones: b[3], sort: i });

    for (const p of [
      ['About Us', 'about', 'Practical, personalised German instruction for over 7 years.',
        '## Who we are\n\nEdexo is a language training institute in Delhi specialising in German, from beginner (A1) to proficiency (C2). We teach online and at our Rohini and Dwarka centres.\n\n## What we offer\n\n- German courses at every level from A1 to C2\n- French, Italian and Japanese courses\n- Exam preparation\n- Guidance for studying or working in Germany\n\nEvery course starts with a free demo class.'],
      ['German Language Classes', 'german-language', 'Learn German from A1 to C2, online or offline.',
        '## German classes in Delhi\n\nOur German courses cover every level from A1 to C2. Choose online or offline batches at Rohini or Dwarka, and start with a free demo class.'],
      ['French Language Classes', 'french-language', 'Beginner French, online or offline.',
        '## French classes in Delhi\n\nStart with French A1: pronunciation, basics and everyday phrases, with a free demo class.'],
      ['Privacy Policy', 'privacy-policy', '', '## Privacy Policy\n\nEdit this page from the admin panel.'],
      ['Terms of Use', 'terms-of-use', '', '## Terms of Use\n\nEdit this page from the admin panel.'],
    ]) await insert('pages', { title: p[0], slug: p[1], subtitle: p[2], content: p[3] });

    const menus = [
      ['header', 'Home', '/'], ['header', 'About Us', '/about'], ['header', 'Courses', '/courses'],
      ['header', 'German Language', '/german-language'], ['header', 'French Language', '/french-language'],
      ['header', 'Blog', '/blog'], ['header', 'Contact', '/contact'],
      ['footer_useful', 'About Us', '/about'], ['footer_useful', 'German Language', '/german-language'],
      ['footer_useful', 'French Language', '/french-language'], ['footer_useful', 'Privacy Policy', '/privacy-policy'],
      ['footer_useful', 'Terms of Use', '/terms-of-use'],
      ['footer_courses', 'German A1 – C2', '/courses?language=german'], ['footer_courses', 'French A1', '/courses/french-a1'],
      ['footer_courses', 'Italian', '/courses/italian'], ['footer_courses', 'Japanese', '/courses/japanese'],
    ];
    for (const [i, m] of menus.entries()) await insert('menu_items', { location: m[0], label: m[1], href: m[2], sort: i });

    await client.query('commit');
    console.log('[seed] done');
  } catch (e) {
    await client.query('rollback');
    throw e;
  }
}

try {
  await seedContent();
  await ensureAdmin();
} finally {
  await client.end();
}
