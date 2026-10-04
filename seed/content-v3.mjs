// Ausbildung in Germany + Study in Germany pages (client PDFs, Oct 2026). Applied once by scripts/seed.mjs.
// Every section stays editable in Admin → Pages → (page) → Page sections.
let n = 0;
const b = (type, o = {}) => ({ id: `s${++n}`, type, ...o });
const L = (...a) => a.join('\n');

export const ausbildung = {
  slug: 'ausbildung-in-germany', oldSlug: 'ausbildung-germany', kind: 'pathway', groupName: 'Abroad', sort: 1,
  title: 'Ausbildung in Germany',
  subtitle: 'German language training and complete Ausbildung guidance — from profile assessment to pre-departure.',
  seoTitle: 'Ausbildung in Germany from India | German Training & Guidance – Edexo',
  seoDescription: 'Explore Ausbildung in Germany with Edexo. Get German language training, exam preparation, career counselling, application guidance, interview preparation and visa assistance.',
  disclaimer: 'Edexo provides German language training, counselling and Ausbildung-related guidance. Admission to an Ausbildung program, training contract, employer selection, placement and visa approval depend on the applicant’s eligibility, program availability, employer/training provider and applicable authorities.',
  sections: [
    b('hero', {
      eyebrow: 'Ausbildung in Germany', title: 'Build Your Career in Germany with Edexo',
      text: 'Learn German. Prepare for Your Ausbildung Journey. Build Your Future in Germany.',
      buttons: L('Check Your Eligibility | #eligibility', 'Book Free Counselling | #counselling', 'WhatsApp Us | whatsapp'),
      items: L('German A1 to C1 training', 'Profile assessment & career counselling', 'Application, interview & visa guidance'),
    }),
    b('text', {
      eyebrow: 'Understand Ausbildung', title: 'What is Ausbildung?',
      text: 'Ausbildung is a vocational training program in Germany that combines practical workplace training with theoretical learning. It allows participants to develop professional skills in a specific occupation while gaining practical experience.',
    }),
    b('cards', {
      tint: true, eyebrow: 'Eligibility', title: 'Who Can Apply?',
      text: 'Eligibility depends on the individual profile and the requirements of the selected Ausbildung program.',
      items: L('Educational Qualification', 'German Language Level', 'Age / Profile Assessment', 'Skills or Work Experience — if applicable', 'Preferred Profession', 'Required Documents', 'Visa Requirements'),
    }),
    b('path', {
      eyebrow: 'German language', title: 'German Language – Your First Step Towards Ausbildung',
      text: 'The required German language level can vary depending on the profession, program, employer and applicable requirements.',
      items: L('A1', 'A2', 'B1', 'B2', 'C1'),
    }),
    b('chips', {
      title: 'What you practise',
      items: L('Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Pronunciation', 'Conversation', 'Workplace Communication', 'Exam Preparation'),
      buttons: L('Explore German Courses | /german-language-course'),
    }),
    b('cards', {
      tint: true, eyebrow: 'Career fields', title: 'Ausbildung Career Fields',
      items: L('Healthcare & Nursing', 'IT & Technology', 'Automotive & Mechatronics', 'Hospitality & Tourism', 'Logistics', 'Retail & Business', 'Technical Professions'),
    }),
    b('cards', {
      eyebrow: 'Why choose Edexo?', title: 'Complete Ausbildung Guidance Under One Roof',
      items: L('German Language Training', 'German Exam Preparation', 'Profile Assessment', 'Career Counselling', 'Ausbildung Guidance', 'Application Guidance', 'CV Preparation', 'Motivation Letter Guidance', 'Interview Preparation', 'Document Guidance', 'German Document Translation', 'Visa Assistance', 'Flight Assistance', 'Pre-Departure Guidance'),
    }),
    b('steps', {
      tint: true, eyebrow: 'Step by step', title: 'Ausbildung Process',
      items: L('Profile Assessment', 'Career Counselling', 'German Language Training', 'Exam Preparation', 'Document Preparation', 'CV & Motivation Letter', 'Ausbildung Application', 'Interview Preparation', 'Training Contract / Offer Guidance', 'Visa Assistance', 'Pre-Departure', 'Germany'),
    }),
    b('ticks', {
      eyebrow: 'Checklist', title: 'Required Documents',
      text: 'Exact document requirements may vary depending on the Ausbildung program and individual profile.',
      items: L('Passport', 'Educational Certificates', 'Mark Sheets', 'CV', 'Motivation Letter', 'German Language Certificate — where applicable', 'Work Experience Documents — if applicable', 'Program-specific Documents', 'Visa Documents'),
    }),
    b('split', {
      tint: true, eyebrow: 'Application support', title: 'Application & Interview',
      columns: [
        { title: 'CV & Motivation Letter', text: 'Build a strong German-style application.', items: L('CV Preparation', 'Motivation Letter Guidance', 'Document Organisation', 'Application Guidance') },
        { title: 'Interview Preparation', text: 'Prepare with confidence for your Ausbildung interview.', items: L('Common Interview Questions', 'German Communication Practice', 'Self Introduction', 'Motivation Questions', 'Profession-related Questions', 'Mock Interview Practice') },
      ],
    }),
    b('note', {
      tone: 'info', title: 'Training Contract',
      text: 'The Ausbildung training contract or offer is issued by the relevant employer or training provider. Edexo provides guidance throughout the process.',
    }),
    b('split', {
      eyebrow: 'Visa & travel', title: 'Visa Assistance & Pre-Departure Support',
      columns: [
        { title: 'Germany Visa Assistance', text: '', items: L('Visa Document Checklist', 'Application Guidance', 'Document Preparation Guidance', 'Visa Process Guidance', 'Pre-Departure Checklist') },
        { title: 'Pre-Departure Support', text: '', items: L('Travel Document Checklist', 'Flight Assistance', 'Pre-Departure Guidance', 'Germany Arrival Preparation', 'Basic Workplace & Cultural Orientation') },
      ],
    }),
    b('note', {
      tone: 'info', title: 'Financial Information',
      text: 'Financial requirements depend on the applicant’s individual circumstances and the applicable program and visa requirements.\n\nMany dual vocational training programs provide training remuneration, but the amount varies depending on the profession, employer and training arrangement.',
    }),
    b('package', {
      eyebrow: 'Support package', title: 'Personalised Ausbildung Support Package',
      text: 'Get guidance tailored to your profile and Ausbildung goals.\n\nPackage details and applicable fees are discussed during counselling based on the student’s profile and requirements.',
      buttons: L('Get Package Details | #counselling', 'Talk to a Counsellor | #counselling'),
      items: L('Ausbildung Guidance', 'German Language Training', 'German Exam Preparation', 'German Document Translation', 'Visa Assistance', 'Visa Fee', 'Flight Ticket', 'Employer / Program Guidance'),
    }),
    b('form', {
      form: 'ausbildung', eyebrow: 'Eligibility check', title: 'Not Sure If You Are Eligible?',
      text: 'Get your profile assessed by our Ausbildung counsellor and understand your Ausbildung pathway for Germany.',
      items: L('Free profile assessment', 'Guidance on language level and documents', 'Online & offline counselling'),
      buttons: 'Thank you! Our Ausbildung counsellor will review your details and contact you shortly.',
    }),
    b('faq', {
      eyebrow: 'FAQs', title: 'Ausbildung FAQs',
      items: L(
        'What is Ausbildung in Germany? :: Ausbildung is a vocational training program in Germany that combines practical workplace training with theoretical learning. It allows participants to develop professional skills in a specific occupation while gaining practical experience.',
        'How long does Ausbildung take? :: The duration of an Ausbildung depends on the profession and training program. Generally, vocational training programs can take around 2 to 3.5 years.',
        'Which German language level is required for Ausbildung? :: The required German language level depends on the profession, training program, employer and applicable requirements. German language skills are important for understanding lessons, communicating at the workplace and managing daily life in Germany.',
        'Is B1 compulsory for every Ausbildung? :: The required language level can vary depending on the specific Ausbildung program, profession, employer and applicable requirements. The exact requirement should be checked for the selected program.',
        'Can I start my German language journey from A1? :: Yes. Students can start learning German from A1 and gradually progress to higher levels such as A2, B1, B2 and C1 according to their Ausbildung and career goals.',
        'What educational qualification is required for Ausbildung? :: Educational requirements vary depending on the profession and Ausbildung program. The relevant school qualification, academic background and other eligibility requirements are assessed according to the selected pathway.',
        'Do Ausbildung students receive remuneration? :: Many dual vocational training programs provide training remuneration. The amount can vary depending on the profession, employer, training year and individual training arrangement.',
        'Does Edexo provide Ausbildung placement support? :: Edexo provides guidance throughout the Ausbildung journey, including profile assessment, career counselling, application guidance, CV and motivation letter support, interview preparation and related assistance. Final selection depends on the employer, training provider, program availability and applicant profile.',
        'Does Edexo provide visa assistance? :: Yes. Edexo provides guidance related to the Germany visa process, including document preparation, checklist guidance and application-related support. Visa decisions are made by the relevant authorities.',
        'What does the Edexo Ausbildung Support Package include? :: The personalised support package can include Ausbildung guidance, German language training, German exam preparation, German document translation, visa assistance, visa fee, flight ticket and employer/program guidance. Package details and applicable fees are discussed during counselling based on the student’s profile and requirements.',
      ),
    }),
    b('cta', {
      title: 'Ready to Start Your Ausbildung Journey?',
      text: 'Take the first step towards your Germany career. Get your profile assessed and understand your Ausbildung pathway with Edexo.',
      buttons: L('Check My Eligibility | #eligibility', 'Book Free Counselling | #counselling', 'WhatsApp Us | whatsapp'),
    }),
    b('links', {
      title: 'Official Information Sources',
      items: L('Make it in Germany | https://www.make-it-in-germany.com/en/', 'Bundesagentur für Arbeit | https://www.arbeitsagentur.de/en'),
    }),
  ],
};

export const studyInGermany = {
  slug: 'study-in-germany', kind: 'pathway', groupName: 'Abroad', sort: 0,
  title: 'Study in Germany',
  subtitle: 'Bachelor’s & Master’s admissions guidance for public and private universities in Germany.',
  seoTitle: 'Study in Germany from India | Bachelor’s & Master’s Admissions | Edexo',
  seoDescription: 'Plan your Bachelor’s or Master’s in Germany with Edexo. Get guidance for public and private universities, eligibility, APS, applications, visa documentation and upcoming 2027 intakes.',
  disclaimer: 'University admission, APS processing, visa decisions, scholarship awards and other outcomes are subject to the rules, eligibility criteria, availability and decisions of the relevant universities and authorities. Requirements and deadlines may change. Students should follow the latest requirements applicable to their selected programme and application period.',
  sections: [
    b('hero', {
      eyebrow: 'Bachelor’s & Master’s Admissions | Public & Private Universities', title: 'Study in Germany',
      text: 'Build your academic future in Germany with structured guidance for university selection, eligibility assessment, application preparation, APS support, visa documentation and pre-departure planning.',
      buttons: L('Check Your Eligibility | #eligibility', 'Book Counselling | #counselling', 'WhatsApp Us | whatsapp'),
      items: L('Online & Offline Counselling Available', 'Summer 2027 & Winter 2027/28 intakes', 'APS, application & visa documentation guidance'),
    }),
    b('text', {
      eyebrow: 'Higher education in Germany', title: 'Why Study in Germany?',
      text: 'Germany offers internationally recognised higher education across public and private universities, universities of applied sciences and specialised institutions. Students can explore Bachelor’s and Master’s programmes across a wide range of disciplines and study formats.\n\nEdexo helps students understand their options and prepare applications according to the requirements of the selected university and programme.',
    }),
    b('timeline', {
      tint: true, eyebrow: '2027 intakes', title: 'Upcoming Intakes',
      text: 'Application deadlines vary by university and programme. Many programmes often use **15 January** for summer-semester applications and **15 July** for winter-semester applications, while some Master’s programmes, Studienkolleg and other courses may have earlier deadlines. Exact deadlines should always be checked for the selected programme.',
      items: L('Summer Intake 2027 — Application planning for programmes starting in the Summer Semester 2027.', 'Winter Intake 2027/28 — Application planning for programmes starting in the Winter Semester 2027/28.'),
    }),
    b('split', {
      eyebrow: 'Choose your path', title: 'Bachelor’s & Master’s Admission',
      columns: [
        { title: 'Bachelor’s Admission from India', text: 'Bachelor’s admission eligibility depends on your Class XII qualification, academic background, chosen subject and university requirements.\n\nEligibility is assessed individually. Meeting a general criterion does not guarantee admission to a specific university or programme.', items: '' },
        { title: 'Master’s Admission', text: 'Master’s admission generally depends on your recognised Bachelor’s degree, academic background, subject compatibility, credits, grades and programme-specific requirements.', items: L('Bachelor’s degree and transcripts', 'Relevant academic background', 'Programme-specific prerequisites and credits', 'Language proficiency', 'CV, motivation letter or other supporting documents where required', 'Additional tests or selection procedures where applicable') },
      ],
    }),
    b('note', {
      tone: 'update', eyebrow: 'Latest update', title: 'Current APS India Eligibility Update (Bachelor’s)',
      items: L(
        'For admissions from Winter Semester 2026/27 onward, students with Class XII qualification, APS and at least 70% overall may qualify for subject-restricted admission through Studienkolleg, subject to the applicable requirements.',
        'Students with Class XII qualification, APS, at least 70% overall and one successfully completed academic year in a recognised Bachelor’s programme may qualify for direct subject-restricted admission to the previous field and closely related subjects, subject to university requirements.',
      ),
    }),
    b('cards', {
      tint: true, eyebrow: 'Preparatory pathway', title: 'Studienkolleg',
      text: 'Studienkolleg is a preparatory pathway for eligible international students whose school qualification does not provide direct access to the intended German university programme. Admission and language requirements vary by Studienkolleg and university.',
      items: L('Subject-specific preparation', 'Entrance examination where required', 'German-language preparation', 'Final assessment through the relevant preparatory examination'),
    }),
    b('note', {
      tone: 'update', eyebrow: 'India-specific update', title: 'dMAT – Current India-Specific Update',
      text: 'APS India has introduced the dMAT for selected Master’s applicants in certain fields. The current affected areas include Engineering; Commerce / Accounting / Finance / Economics; and Business / Management.\n\nThe first dMAT test date was 26 September 2026. Applicants should check the latest APS India requirements applicable to their programme and application timeline.',
    }),
    b('split', {
      eyebrow: 'University options', title: 'Public vs Private Universities',
      columns: [
        { title: 'Public Universities', text: 'Public universities in Germany offer a broad range of academic programmes and are an important option for international students. Tuition and semester-related costs depend on the university, state, programme and student status.\n\nEdexo can help you shortlist suitable public-university options based on your academic profile and programme preferences.', items: '' },
        { title: 'Private Universities', text: 'Private universities and higher education institutions offer additional programme choices, including career-oriented and international programmes. Tuition fees vary by institution and programme.\n\nWe help students compare programme structure, eligibility, tuition, location and admission requirements before applying.', items: '' },
      ],
    }),
    b('split', {
      tint: true, eyebrow: 'Language of instruction', title: 'German-Taught & English-Taught Programmes',
      columns: [
        { title: 'German-Taught Programmes', text: 'Depending on the programme, applicants may need German-language proof such as TestDaF, DSH or another accepted certificate.', items: '' },
        { title: 'English-Taught Programmes', text: 'Many international programmes are offered in English. Depending on the programme, proof such as IELTS, TOEFL or another accepted qualification may be required. Exact language requirements are set by the university.', items: '' },
      ],
      buttons: '',
    }),
    b('chips', {
      eyebrow: 'Subjects', title: 'Popular Study Areas',
      items: L('Engineering & Technology', 'Computer Science & Information Technology', 'Business & Management', 'Finance, Accounting & Economics', 'Data Science & Artificial Intelligence', 'Mechanical & Automotive Engineering', 'Electrical & Electronics Engineering', 'Life Sciences & Biotechnology', 'Social Sciences & Humanities', 'Architecture & Design'),
      buttons: L('German Language Courses | /german-language-course', 'IELTS Preparation | /ielts-preparation'),
    }),
    b('cards', {
      tint: true, eyebrow: 'Shortlisting', title: 'University & Course Selection',
      text: 'Choosing the right programme is the foundation of a successful application. Edexo helps students compare:',
      items: L('Programme content and specialisation', 'Admission requirements', 'Language requirements', 'Tuition and semester costs', 'Location and career orientation', 'Application route and deadlines', 'Academic eligibility and recognition'),
    }),
    b('split', {
      eyebrow: 'Assessment & APS', title: 'Eligibility Assessment & APS India Support',
      columns: [
        { title: 'Eligibility Assessment', text: 'Our counselling process begins with an academic profile review covering education, grades, subject background, language proficiency, study goals and preferred intake.\n\nStudents receive guidance on suitable programme categories and the next steps for their application.', items: '' },
        { title: 'APS India Support', text: 'APS India verifies academic documents for applicants from India in the applicable categories. APS requirements depend on the applicant’s academic stage and situation. APS does not decide university admission or issue the university’s admission decision.', items: L('APS application guidance', 'Document checklist support', 'Academic-document preparation', 'Process guidance based on the latest applicable APS requirements') },
      ],
    }),
    b('note', {
      tone: 'info', title: 'Degree & University Recognition',
      text: 'Academic eligibility and recognition are assessed according to the requirements applicable to the chosen university and programme. Where relevant, students may need to check their institution or qualification through recognised German information systems and the university’s own admission rules.',
    }),
    b('steps', {
      tint: true, eyebrow: 'Step by step', title: 'Application Process',
      items: L('Profile & eligibility assessment', 'Course and university shortlisting', 'Document preparation', 'APS planning — where applicable', 'Language and test planning', 'Application submission', 'Application status follow-up', 'Admission decision guidance', 'Visa documentation support', 'Pre-departure guidance'),
    }),
    b('split', {
      eyebrow: 'Applying', title: 'University Application, uni-assist & Deadlines',
      columns: [
        { title: 'University Application & uni-assist', text: 'Some German universities use uni-assist to evaluate international applications. Other universities may have their own application systems.\n\nWhere uni-assist is responsible, the application is submitted through the applicable uni-assist process. The university makes the final admission decision.', items: '' },
        { title: 'Application Deadlines', text: 'Deadlines are university- and programme-specific. Many programmes often have deadlines around **15 January** for summer-semester starts and **15 July** for winter-semester starts, but earlier deadlines are common for certain Master’s programmes, Studienkolleg and specific courses.\n\nFor uni-assist applications, applying as early as possible is recommended; uni-assist advises applying at least eight weeks before the deadline where possible.', items: '' },
      ],
    }),
    b('ticks', {
      tint: true, eyebrow: 'Checklist', title: 'Document Preparation',
      items: L('Academic certificates and transcripts', 'APS-related documents — where applicable', 'Passport', 'Language certificates', 'CV', 'Motivation letter / SOP', 'Recommendation letters — where required', 'Portfolio or additional documents — for selected programmes', 'Certified translations — where required'),
    }),
    b('split', {
      eyebrow: 'Your application', title: 'CV & SOP / Motivation Letter',
      columns: [
        { title: 'CV Preparation', text: 'Create a clear, structured academic CV highlighting education, internships, projects, work experience, certifications, skills, achievements and relevant extracurricular activities.', items: '' },
        { title: 'SOP / Motivation Letter', text: 'A strong motivation letter should clearly explain your academic background, reasons for selecting the programme, career goals and why the chosen university and course fit your plans.', items: '' },
      ],
    }),
    b('split', {
      tint: true, eyebrow: 'Funding', title: 'Scholarships & Financial Planning',
      columns: [
        { title: 'Scholarships', text: 'Students may explore scholarships offered by German institutions, foundations, universities and other recognised funding organisations. Eligibility, deadlines and funding levels vary by scholarship.', items: '' },
        { title: 'Financial Planning', text: 'Students should plan tuition or semester-related costs, accommodation, health insurance, living expenses, travel and visa-related financial requirements. Financial proof requirements can change, so the applicable amount and accepted proof should be checked at the time of visa application.', items: '' },
      ],
    }),
    b('split', {
      eyebrow: 'Visa & travel', title: 'Student Visa Assistance & Pre-Departure Support',
      columns: [
        { title: 'Student Visa Assistance', text: 'Edexo provides guidance for preparing the documentation and application steps related to the German student visa process. Visa decisions are made by the competent German authorities.', items: L('Visa document checklist', 'Financial-proof planning', 'Insurance and supporting-document guidance', 'Application-form guidance', 'Appointment and submission preparation') },
        { title: 'Pre-Departure Support', text: '', items: L('Travel planning', 'Document checklist', 'University onboarding preparation', 'Accommodation search guidance', 'Banking and essential arrival planning', 'Germany arrival checklist') },
      ],
    }),
    b('cards', {
      tint: true, eyebrow: 'Edexo support', title: 'Edexo Study in Germany Support',
      text: 'From the first profile assessment to application preparation and pre-departure planning, Edexo provides structured support for students planning higher education in Germany.',
      items: L('Bachelor’s & Master’s counselling', 'Public & Private university options', 'Course shortlisting', 'Eligibility assessment', 'Application support', 'APS guidance', 'Visa documentation guidance', 'Pre-departure support'),
    }),
    b('form', {
      form: 'study', eyebrow: 'Eligibility assessment', title: 'Get Your Profile Assessed',
      text: 'Share your academic profile with our counsellors to receive personalised guidance — or book a free counselling session to understand your options for studying in Germany.',
      items: L('Bachelor’s, Master’s and Studienkolleg guidance', 'Public & private university options', 'Online & offline counselling'),
      buttons: 'Thank you! Our Study in Germany counsellor will review your profile and contact you shortly.',
    }),
    b('faq', {
      eyebrow: 'FAQs', title: 'FAQ – Bachelor’s',
      items: L(
        'Can I study in Germany after Class XII? :: Yes, depending on your qualification, academic profile, subject background and the admission route applicable to you.',
        'Is 70% in Class XII enough? :: For admissions from Winter Semester 2026/27 onward, APS India has specified pathways involving a minimum 70% overall for certain applicants. The applicable pathway and university requirements must be assessed individually.',
        'Do I need Studienkolleg? :: Some students may need Studienkolleg depending on their educational qualification and eligibility for direct university admission.',
      ),
    }),
    b('faq', {
      title: 'FAQ – Master’s',
      items: L(
        'Can I apply for a Master’s in Germany after an Indian Bachelor’s degree? :: Yes, subject to recognition, academic compatibility, credits, grades and the specific university and programme requirements.',
        'What is dMAT? :: dMAT is an additional APS requirement for selected Master’s applicants in specified fields. Applicability depends on the applicant’s programme and APS procedure.',
        'Do all Master’s programmes require dMAT? :: No. The requirement applies to selected applicants and fields as specified by APS India.',
      ),
    }),
    b('faq', {
      title: 'FAQ – Public, Private & Applications',
      items: L(
        'Are public universities free? :: Costs vary. Some programmes may have no tuition fee while semester contributions and other costs apply. Certain states, programmes or student categories may have tuition charges.',
        'Are private universities available in Germany? :: Yes. Private higher education institutions offer a range of programmes with institution-specific tuition and admission requirements.',
        'Can I apply through uni-assist? :: If the selected university and programme use uni-assist, the application can be submitted through the applicable uni-assist procedure. The university makes the admission decision.',
      ),
    }),
    b('cards', {
      tint: true, eyebrow: 'Why Edexo', title: 'Why Choose Edexo?',
      items: L('Structured application guidance', 'Personalised profile assessment', 'Bachelor’s & Master’s support', 'Public & Private university options', 'APS and visa documentation guidance', 'Germany-focused counselling', 'Online & Offline support'),
    }),
    b('cta', {
      title: 'Plan Your Study Journey to Germany',
      text: 'Start with your profile assessment and discover suitable Bachelor’s or Master’s study options in Germany.',
      buttons: L('Enquire Now | #counselling', 'Book Counselling | #counselling', 'Check Your Eligibility | #eligibility'),
    }),
  ],
};
