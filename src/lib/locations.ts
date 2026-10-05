/** Service-area groups for location pages (default 'who joins' points; each location can override). */
export const CLUSTERS: Record<string, { label: string; audience: string; near: boolean }> = {
  rohini: {
    label: 'Rohini, Pitampura & nearby',
    audience: 'School and college students preparing for German A1–B2\nWorking professionals from nearby offices and markets\nStudents planning to study or do Ausbildung in Germany\nParents looking for German or French classes for kids (8–16)',
    near: true,
  },
  campus: {
    label: 'North Campus, Model Town & Civil Lines',
    audience: 'Delhi University students who want a foreign language alongside their degree\nStudents preparing for IELTS, Goethe or other language exams\nGraduates planning a Master’s in Germany\nWorking professionals who prefer weekend or evening batches',
    near: false,
  },
  outerRohini: {
    label: 'Outer Rohini & West',
    audience: 'Class 10–12 students starting a new language early\nCollege students and job seekers building an international profile\nCandidates preparing for Ausbildung and work in Germany\nLearners who prefer live online classes from home',
    near: false,
  },
  outerNorth: {
    label: 'Outer North Delhi',
    audience: 'Students who want to start German from A1 with a free demo\nYoung professionals exploring Ausbildung or jobs in Germany\nLearners who prefer live online classes to save travel time\nParents looking for structured language classes for kids',
    near: false,
  },
  haryana: {
    label: 'Haryana (NCR)',
    audience: 'University and college students in the Sonipat education hub\nGraduates planning to study in Germany\nProfessionals who want live online evening or weekend batches\nCandidates preparing for German exams such as Goethe or TELC',
    near: false,
  },
};

