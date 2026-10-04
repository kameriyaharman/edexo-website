/** Blog categories from the Edexo content brief (admins can type others too). */
export const BLOG_CATEGORIES = [
  'Learn German', 'German Exams', 'Study in Germany', 'Ausbildung', 'IELTS / PTE / TOEFL', 'French', 'Spanish', 'Japanese',
  'Language Learning Tips', 'International Education',
];
export const categorySlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
