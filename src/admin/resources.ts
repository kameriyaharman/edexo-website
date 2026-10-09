import { schema } from '@/db';
import { iconNames } from '@/components/Icon';
import type { FieldDef } from '@/lib/settings';
import { BLOG_CATEGORIES } from '@/lib/blog';
import { CLUSTERS } from '@/lib/locations';

const icons = iconNames.map((v) => ({ value: v, label: v }));
const toneOpts = ['orange', 'navy', 'green', 'amber', 'blue'].map((v) => ({ value: v, label: v }));

export interface ResourceField extends FieldDef {
  /** select options loaded from another resource table: [resourceKey, labelColumn] */
  optionsFrom?: [string, string];
}

export interface Resource {
  key: string;
  label: string;
  singular: string;
  description?: string;
  table: any; // drizzle table
  fields: ResourceField[];
  columns: string[];
  orderBy: 'sort' | 'publishedAt' | 'createdAt' | 'startDate';
  /** shows a "Duplicate" button (copy a record, then change a few fields) */
  duplicable?: boolean;
  slugFrom?: string;
  viewUrl?: (row: any) => string | null;
}

const seo: ResourceField[] = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', maxLength: 60, help: 'Shown in Google results. Leave empty to use the name.' },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', maxLength: 160, help: 'One or two sentences for Google results.' },
];

const FAQ_HELP = 'Question on one line, answer on the next line(s). Leave an empty line between FAQs.';
const pageKinds = [
  { value: 'page', label: 'Standard page' }, { value: 'service', label: 'Service / landing page' }, { value: 'exam', label: 'Exam preparation page' },
  { value: 'pathway', label: 'Section-based page (Ausbildung, Study in Germany…)' }, { value: 'city', label: 'City landing page' }, { value: 'legal', label: 'Legal page (no enquiry form)' }, { value: 'special', label: 'Franchise / Careers (has its own form)' },
];

export const resources: Resource[] = [
  {
    key: 'courses', label: 'Courses & fees', singular: 'course', table: schema.courses, orderBy: 'sort', slugFrom: 'title',
    description: 'One row per level (German A1, Japanese N5…). Fees appear on the program page, the Courses & Fees page and the course page.',
    columns: ['title', 'languageId', 'price', 'priceOffline', 'duration', 'published'],
    viewUrl: (r) => `/${r.slug}`,
    fields: [
      { name: 'title', label: 'Course name', type: 'text', required: true, placeholder: 'German A1' },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Page opens at /your-slug, e.g. german-a1-course. Leave empty to create it from the name.' },
      { name: 'languageId', label: 'Program', type: 'select', optionsFrom: ['languages', 'name'] },
      { name: 'level', label: 'Level', type: 'text', placeholder: 'A1 / N5 / HSK 1' },
      { name: 'shortDesc', label: 'Short description (cards and page subtitle)', type: 'textarea' },
      { name: 'price', label: 'Fee — online', type: 'number', prefix: '₹', group: 'Fees & batch', help: 'Leave empty to show "On enquiry".' },
      { name: 'priceOffline', label: 'Fee — offline', type: 'number', prefix: '₹', group: 'Fees & batch', help: 'Same as online? Enter the same number.' },
      { name: 'mrp', label: 'Original price (MRP, optional)', type: 'number', prefix: '₹', group: 'Fees & batch' },
      { name: 'duration', label: 'Duration', type: 'text', placeholder: '3 to 6 months', group: 'Fees & batch' },
      { name: 'mode', label: 'Mode', type: 'text', placeholder: 'Online / Offline', group: 'Fees & batch' },
      { name: 'format', label: 'Format', type: 'text', placeholder: 'Group & One-to-One', group: 'Fees & batch' },
      { name: 'timings', label: 'Timings', type: 'textarea', group: 'Fees & batch' },
      { name: 'description', label: 'Intro & syllabus (course page)', type: 'markdown' },
      { name: 'whoShouldJoin', label: 'Who should join', type: 'textarea', group: 'Course page sections' },
      { name: 'outcomes', label: 'Learning outcomes (one per line)', type: 'lines', group: 'Course page sections' },
      { name: 'studyMaterial', label: 'Study material', type: 'textarea', group: 'Course page sections' },
      { name: 'examPrep', label: 'Exam preparation', type: 'textarea', group: 'Course page sections' },
      { name: 'eligibility', label: 'Eligibility', type: 'textarea', group: 'Course page sections' },
      { name: 'highlights', label: 'Benefits (one per line)', type: 'lines', group: 'Course page sections' },
      { name: 'faqs', label: 'FAQs', type: 'textarea', help: FAQ_HELP, group: 'FAQs' },
      { name: 'imageId', label: 'Course image (landscape)', type: 'image' },
      { name: 'featured', label: 'Featured (blog "related courses")', type: 'boolean' },
      { name: 'published', label: 'Published (visible on site)', type: 'boolean' },
      { name: 'sort', label: 'Order within program (lower first)', type: 'number' },
      ...seo,
    ],
  },
  {
    key: 'languages', label: 'Programs', singular: 'program', table: schema.languages, orderBy: 'sort', slugFrom: 'name',
    description: 'Language programs (German A1–C2, French, Japanese N5–N1, German for Kids…). Each has its own page with a fee table.',
    columns: ['imageId', 'name', 'slug', 'showOnHome', 'active'],
    viewUrl: (r) => `/${r.slug}`,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'German' },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Page opens at /your-slug, e.g. german-language-course.' },
      { name: 'title', label: 'Page heading', type: 'text', placeholder: 'German Language Course A1–C2' },
      { name: 'tagline', label: 'Subtitle', type: 'text' },
      { name: 'code', label: 'Badge code (e.g. DE)', type: 'text' },
      { name: 'category', label: 'Type', type: 'select', options: [{ value: 'language', label: 'Language program' }, { value: 'kids', label: 'Kids program' }] },
      { name: 'levelLabel', label: 'Fee table: first column heading', type: 'text', placeholder: 'Level / JLPT level / HSK level' },
      { name: 'intro', label: 'Short intro', type: 'textarea' },
      { name: 'description', label: 'Program page content', type: 'markdown' },
      { name: 'highlights', label: 'Highlight cards (one per line, "Title — text")', type: 'lines', group: 'Program page sections' },
      { name: 'feeNote', label: 'Note under the fee heading', type: 'textarea', group: 'Program page sections' },
      { name: 'examPrep', label: 'Exam preparation box', type: 'textarea', group: 'Program page sections' },
      { name: 'faqs', label: 'FAQs', type: 'textarea', help: FAQ_HELP, group: 'FAQs' },
      { name: 'homeTitle', label: 'Card title on home page', type: 'text', group: 'Home page card' },
      { name: 'homeBlurb', label: 'Card text on home page', type: 'textarea', group: 'Home page card' },
      { name: 'imageId', label: 'Program image (landscape)', type: 'image' },
      { name: 'showOnHome', label: 'Show in "Popular Language Programs"', type: 'boolean' },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
      ...seo,
    ],
  },
  {
    key: 'posts', label: 'Blog posts', singular: 'post', table: schema.posts, orderBy: 'publishedAt', slugFrom: 'title',
    columns: ['coverId', 'title', 'category', 'publishedAt', 'published'],
    viewUrl: (r) => `/blog/${r.slug}`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to create it from the title.' },
      { name: 'excerpt', label: 'Excerpt (card)', type: 'textarea' },
      { name: 'coverId', label: 'Cover image', type: 'image' },
      { name: 'content', label: 'Article', type: 'markdown' },
      { name: 'category', label: 'Category', type: 'select', options: BLOG_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'keyPoints', label: 'Key points (one per line)', type: 'lines', group: 'Key points, FAQs & related course' },
      { name: 'faqs', label: 'FAQs', type: 'textarea', help: FAQ_HELP, group: 'Key points, FAQs & related course' },
      { name: 'relatedLanguageId', label: 'Related program', type: 'select', optionsFrom: ['languages', 'name'], group: 'Key points, FAQs & related course' },
      { name: 'publishedAt', label: 'Publish date', type: 'date' },
      { name: 'published', label: 'Published', type: 'boolean' },
      ...seo,
    ],
  },
  {
    key: 'testimonials', label: 'Testimonials', singular: 'testimonial', table: schema.testimonials, orderBy: 'sort',
    columns: ['photoId', 'name', 'rating', 'active'],
    fields: [
      { name: 'name', label: 'Student name', type: 'text', required: true },
      { name: 'role', label: 'Course / role', type: 'text' },
      { name: 'quote', label: 'Review', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'photoId', label: 'Photo (square)', type: 'image' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'pages', label: 'Pages', singular: 'page', table: schema.pages, orderBy: 'sort', slugFrom: 'title',
    description: 'About, service pages (online classes, study in Germany…), exam pages, franchise, careers and legal pages. Each opens at /slug.',
    columns: ['title', 'kind', 'slug', 'published'],
    viewUrl: (r) => (r.slug === 'about' ? '/about' : `/${r.slug}`),
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Page opens at /slug. "about", "franchise" and "careers" have special layouts.' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'kind', label: 'Page type', type: 'select', options: pageKinds },
      { name: 'groupName', label: 'Group', type: 'text', help: 'Exam pages: the language (German, English…) used to group them on the home page.' },
      { name: 'content', label: 'Content (standard pages)', type: 'markdown' },
      { name: 'sections', label: 'Page sections', type: 'blocks', help: 'Used when Page type is "Section-based page". Click a section to edit it; use ↑ ↓ to reorder.' },
      { name: 'highlightsTitle', label: 'Highlights heading', type: 'text', group: 'Highlights & disclaimer' },
      { name: 'highlights', label: 'Highlights (one per line)', type: 'lines', group: 'Highlights & disclaimer' },
      { name: 'disclaimer', label: 'Disclaimer (small note)', type: 'textarea', group: 'Highlights & disclaimer' },
      { name: 'faqs', label: 'FAQs', type: 'textarea', help: FAQ_HELP, group: 'FAQs' },
      { name: 'ctaTitle', label: 'Call-to-action heading', type: 'text', group: 'Call to action' },
      { name: 'ctaText', label: 'Call-to-action text', type: 'textarea', group: 'Call to action' },
      { name: 'imageId', label: 'Image (optional)', type: 'image' },
      { name: 'showEnquiry', label: 'Show demo/enquiry form', type: 'boolean' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
      ...seo,
    ],
  },
  {
    key: 'faqs', label: 'FAQs', singular: 'FAQ', table: schema.faqs, orderBy: 'sort',
    description: 'General FAQs for the home page and /faqs. Program, course and page FAQs are edited on those records.',
    columns: ['question', 'groupName', 'showOnHome', 'active'],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, help: 'Keep answers in line with actual Edexo policy.' },
      { name: 'groupName', label: 'Group', type: 'select', options: ['General', 'Course', 'Exams', 'Study Abroad', 'Fees', 'Online Classes'].map((v) => ({ value: v, label: v })) },
      { name: 'showOnHome', label: 'Show on home page', type: 'boolean' },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
    ],
  },
  {
    key: 'trainers', label: 'Trainers', singular: 'trainer', table: schema.trainers, orderBy: 'sort',
    description: 'Shown as "Meet Our Trainers" on the About page when at least one is active.',
    columns: ['photoId', 'name', 'role', 'active'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', placeholder: 'German Trainer' },
      { name: 'languages', label: 'Languages / levels', type: 'text', placeholder: 'German A1–C1' },
      { name: 'bio', label: 'Short bio', type: 'textarea' },
      { name: 'photoId', label: 'Photo (square)', type: 'image' },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
    ],
  },
  {
    key: 'jobs', label: 'Job openings', singular: 'job opening', table: schema.jobs, orderBy: 'sort',
    description: 'Careers page. Only ACTIVE openings are shown — switch a role on only when it is actually open.',
    columns: ['title', 'department', 'location', 'active'],
    fields: [
      { name: 'title', label: 'Position', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'employmentType', label: 'Type', type: 'select', options: ['Full-time', 'Part-time', 'Freelance', 'Internship'].map((v) => ({ value: v, label: v })) },
      { name: 'description', label: 'Description', type: 'markdown' },
      { name: 'requirements', label: 'Requirements (one per line)', type: 'lines' },
      { name: 'active', label: 'Open (shown on site)', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
    ],
  },
  {
    key: 'branches', label: 'Centres', singular: 'centre', table: schema.branches, orderBy: 'sort',
    columns: ['name', 'phones', 'active'],
    fields: [
      { name: 'name', label: 'Centre name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'landmark', label: 'Nearby metro / landmark', type: 'text' },
      { name: 'phones', label: 'Phone numbers (one per line)', type: 'lines' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mapUrl', label: 'Google Maps link', type: 'url' },
      { name: 'hours', label: 'Working hours', type: 'textarea', placeholder: 'Mon–Sat: 9:00 am – 7:00 pm' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'features', label: 'Feature strip', singular: 'feature', table: schema.features, orderBy: 'sort',
    description: 'The row of 4 icons under the hero.',
    columns: ['title', 'icon', 'active'],
    fields: [
      { name: 'title', label: 'Text', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'reasons', label: 'Why Edexo cards', singular: 'reason', table: schema.reasons, orderBy: 'sort',
    description: 'The cards in "Why Choose Edexo?".',
    columns: ['title', 'icon', 'active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Text', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'levels', label: 'Course levels', singular: 'level', table: schema.levels, orderBy: 'sort',
    description: 'The "Your Path From A1 to C2" cards.',
    columns: ['code', 'title', 'featured', 'active'],
    fields: [
      { name: 'code', label: 'Level code (e.g. A1)', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Text', type: 'textarea' },
      { name: 'buttonLabel', label: 'Button label', type: 'text' },
      { name: 'link', label: 'Button link', type: 'text' },
      { name: 'featured', label: 'Highlighted (dark card)', type: 'boolean' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'stats', label: 'Stats', singular: 'stat', table: schema.stats, orderBy: 'sort',
    columns: ['value', 'label', 'active'],
    fields: [
      { name: 'value', label: 'Number (e.g. 7+)', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: icons },
      { name: 'tone', label: 'Colour', type: 'select', options: toneOpts },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    key: 'menu', label: 'Menus', singular: 'menu link', table: schema.menuItems, orderBy: 'sort',
    description: 'Header navigation (with dropdowns) and the footer link columns.',
    columns: ['label', 'href', 'location', 'parentId', 'active'],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'href', label: 'Link (e.g. /courses or https://…)', type: 'text', required: true },
      { name: 'location', label: 'Where', type: 'select', options: [
        { value: 'header', label: 'Header' }, { value: 'footer_useful', label: 'Footer — Quick Links' }, { value: 'footer_courses', label: 'Footer — Popular Programs' },
        { value: 'footer_support', label: 'Footer — Support' },
      ] },
      { name: 'parentId', label: 'Dropdown under (header only)', type: 'select', optionsFrom: ['menu', 'label'], help: 'Choose a top-level header item to put this link inside its dropdown.' },
      { name: 'description', label: 'Dropdown hint (optional)', type: 'text' },
      { name: 'sort', label: 'Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
];

resources.push({
  key: 'locations', label: 'Locations', singular: 'location', table: schema.locations, orderBy: 'sort', slugFrom: 'name',
  description: 'Service-area pages (e.g. /language-classes-in-pitampura). Each has its own content, FAQs and an enquiry form; all are listed on /areas-we-serve.',
  columns: ['name', 'slug', 'cluster', 'active'],
  viewUrl: (r) => `/${r.slug}`,
  fields: [
    { name: 'name', label: 'Area name', type: 'text', required: true, placeholder: 'Pitampura' },
    { name: 'slug', label: 'URL slug', type: 'text', help: 'e.g. language-classes-in-pitampura. Leave empty to create it from the name.' },
    { name: 'cluster', label: 'Area group', type: 'select', options: Object.entries(CLUSTERS).map(([value, c]) => ({ value, label: c.label })), help: 'Used for the "Nearby areas" links and the default "Who joins" points.' },
    { name: 'region', label: 'State', type: 'select', options: [{ value: 'Delhi', label: 'Delhi' }, { value: 'Haryana', label: 'Haryana' }, { value: 'Uttar Pradesh', label: 'Uttar Pradesh' }] },
    { name: 'branchId', label: 'Nearest Edexo centre', type: 'select', optionsFrom: ['branches', 'name'] },
    { name: 'intro', label: 'Hero text (leave empty for the standard text)', type: 'textarea' },
    { name: 'areaNote', label: 'About the area (shown under "Learn a New Language — Close to …")', type: 'textarea' },
    { name: 'audience', label: '"Who joins from this area" points (one per line, empty = group default)', type: 'lines' },
    { name: 'content', label: 'Extra content (optional)', type: 'markdown' },
    { name: 'faqs', label: 'Extra FAQs', type: 'textarea', help: FAQ_HELP + ' Five location FAQs are added automatically.' },
    { name: 'imageId', label: 'Photo (optional)', type: 'image' },
    { name: 'active', label: 'Published', type: 'boolean' },
    { name: 'sort', label: 'Order', type: 'number' },
    ...seo,
  ],
});

resources.push({
  key: 'redirects', label: 'Redirects', singular: 'redirect', table: schema.redirects, orderBy: 'sort',
  description: 'Send old or changed URLs to the right page (301), so Google rankings and old links keep working.',
  columns: ['fromPath', 'toPath', 'hits', 'active'],
  fields: [
    { name: 'fromPath', label: 'Old URL path', type: 'text', required: true, placeholder: '/course/german-language-course-a1-level', help: 'Only the part after the domain, starting with /' },
    { name: 'toPath', label: 'Send visitors to', type: 'text', required: true, placeholder: '/courses/german-a1', help: 'A path on this site (/courses) or a full https:// address' },
    { name: 'permanent', label: 'Permanent (301) — recommended for SEO', type: 'boolean' },
    { name: 'active', label: 'Active', type: 'boolean' },
    { name: 'sort', label: 'Order', type: 'number' },
  ],
});

const DAYS = ['Monday to Friday', 'Monday to Saturday', 'Mon, Wed, Fri', 'Tue, Thu, Sat', 'Saturday & Sunday (Weekend)', 'Sunday only', 'Daily'];
const DURATIONS = ['1 month', '6 weeks', '2 months', '2.5 months', '3 months', '4 months', '6 months'];

resources.push({
  key: 'batches', label: 'Upcoming batches', singular: 'batch', table: schema.batches, orderBy: 'startDate', duplicable: true,
  description: 'Batches shown on /upcoming-batches (and on course pages). A batch hides itself after its start date — for the next batch, open one and click "Duplicate", then change the date.',
  columns: ['courseId', 'startDate', 'timeFrom', 'mode', 'seats', 'active'],
  viewUrl: () => '/upcoming-batches',
  fields: [
    { name: 'courseId', label: 'Course', type: 'select', optionsFrom: ['courses', 'title'], help: 'Fills the course name and links "Book Free Demo" to this course.' },
    { name: 'title', label: 'Course name on the site (optional)', type: 'text', placeholder: 'e.g. German A1 — Fast Track', help: 'Leave empty to use the course name.' },
    { name: 'level', label: 'Level (optional)', type: 'text', placeholder: 'A1', help: 'Leave empty to use the course level.' },
    { name: 'startDate', label: 'Batch start date', type: 'date', required: true, group: 'Date & time' },
    { name: 'days', label: 'Days', type: 'text', placeholder: 'Monday to Friday', suggestions: DAYS, group: 'Date & time', help: 'Pick one or type your own.' },
    { name: 'timeFrom', label: 'Class starts at', type: 'time', group: 'Date & time' },
    { name: 'timeTo', label: 'Class ends at', type: 'time', group: 'Date & time' },
    { name: 'duration', label: 'Course duration', type: 'text', placeholder: '3 months', suggestions: DURATIONS, group: 'Date & time', help: 'Leave empty to use the course duration.' },
    { name: 'mode', label: 'Mode', type: 'select', required: true, options: ['Online', 'Offline', 'Online & Offline'].map((v) => ({ value: v, label: v })), group: 'Mode, centre & seats' },
    { name: 'branchId', label: 'Centre (offline batches)', type: 'select', optionsFrom: ['branches', 'name'], group: 'Mode, centre & seats' },
    { name: 'location', label: 'Location text (optional)', type: 'text', placeholder: 'Live on Zoom', group: 'Mode, centre & seats', help: 'Overrides the location shown. Empty = centre name, or "Live online" for online batches.' },
    { name: 'seats', label: 'Available seats', type: 'number', group: 'Mode, centre & seats', help: 'Seats still open. 0 = "Batch full". Empty = hide the seat count.' },
    { name: 'totalSeats', label: 'Total seats (optional)', type: 'number', group: 'Mode, centre & seats', help: 'Shows a small "filled" bar, e.g. 8 of 12 left.' },
    { name: 'badge', label: 'Badge (optional)', type: 'text', placeholder: 'Weekend batch', suggestions: ['New', 'Weekend batch', 'Fast track', 'Evening batch', 'Few seats left', 'Kids batch'] },
    { name: 'note', label: 'Short note (optional)', type: 'text', placeholder: 'Goethe exam prep included' },
    { name: 'active', label: 'Show on site', type: 'boolean' },
    { name: 'sort', label: 'Order (only for batches on the same date)', type: 'number' },
  ],
});

export function getResource(key: string) {
  return resources.find((r) => r.key === key) ?? null;
}
