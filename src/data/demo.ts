export type Goal = 'work' | 'income' | 'study' | 'skill' | 'business' | 'help';

export type DemoResource = {
  name: string;
  category: string;
  purpose: string;
  eligibility: string;
  documents: string[];
  location: string;
  method: string;
  url: string;
  source: string;
  verifiedOn: string;
  languages: string[];
};

export type Lesson = {
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  complete?: boolean;
};

export const goals: Array<{ id: Goal; label: string; tamil: string; icon: string; tone: string }> = [
  { id: 'work', label: 'Work', tamil: 'வேலை', icon: 'briefcase', tone: 'green' },
  { id: 'income', label: 'Income', tamil: 'வருமானம்', icon: 'coins', tone: 'gold' },
  { id: 'study', label: 'Study', tamil: 'படிப்பு', icon: 'book', tone: 'blue' },
  { id: 'skill', label: 'New skill', tamil: 'புதிய skill', icon: 'spark', tone: 'coral' },
  { id: 'business', label: 'Business', tamil: 'தொழில்', icon: 'shop', tone: 'mint' },
  { id: 'help', label: 'Help', tamil: 'உதவி', icon: 'help', tone: 'lavender' },
];

export const strengths = [
  { id: 'tailoring', tamil: 'தையல்', english: 'Tailoring', emoji: '🧵', note: 'ஒரு skill உங்களிடம் ஏற்கனவே உள்ளது' },
  { id: 'cooking', tamil: 'சமையல்', english: 'Cooking', emoji: '🍳', note: 'உங்கள் கைகளால் உருவாக்கும் திறன்' },
  { id: 'craft', tamil: 'கைவினை', english: 'Handcraft', emoji: '🎨', note: 'படைப்பாற்றல் உங்கள் பலம்' },
  { id: 'phone', tamil: 'Mobile', english: 'Phone use', emoji: '📱', note: 'டிஜிட்டல் உலகில் முதல் படி' },
  { id: 'computer', tamil: 'Computer', english: 'Computer', emoji: '💻', note: 'புதிய வாய்ப்புகளுக்கான கதவு' },
  { id: 'other', tamil: 'வேறு', english: 'Something else', emoji: '＋', note: 'வேறு ஒன்றிலிருந்து தொடங்கலாம்' },
] as const;

export const demoResource: DemoResource = {
  name: 'Verified skill learning resource',
  category: 'Skill development',
  purpose: 'Find a safe place to explore a first tailoring lesson.',
  eligibility: 'Shown as a demo record only. Check the official source before applying.',
  documents: ['No documents needed to explore the lesson'],
  location: 'Online / your nearby training centre',
  method: 'Open official source and follow one step at a time',
  url: 'https://www.skillindiadigital.gov.in/',
  source: 'Skill India Digital (official source)',
  verifiedOn: '01 Oct 2026',
  languages: ['தமிழ்', 'हिन्दी', 'English'],
};

export const journeyItems = [
  { label: 'I can search', complete: true },
  { label: 'I can open an official website', complete: true },
  { label: 'I can identify a trusted source', complete: true },
  { label: 'I can fill a basic form', complete: false },
  { label: 'I am learning document upload', complete: false },
];

export const lessons: Lesson[] = [
  { title: 'How to open a website', subtitle: 'ஒரு website-ஐ திறப்பது எப்படி', duration: '3 min', icon: 'globe', complete: true },
  { title: 'How to search', subtitle: 'தேடுவது எப்படி', duration: '4 min', icon: 'search', complete: true },
  { title: 'How to spot an official website', subtitle: 'நம்பகமான website எது?', duration: '5 min', icon: 'shield', complete: false },
  { title: 'How to fill an online form', subtitle: 'ஒரு form-ஐ நிரப்புவது', duration: '6 min', icon: 'form', complete: false },
  { title: 'How to protect OTPs and passwords', subtitle: 'உங்கள் ரகசியத்தை பாதுகாப்பது', duration: '4 min', icon: 'lock', complete: false },
];

export const languageLabels = [
  { code: 'ta-IN', label: 'தமிழ்', short: 'TA' },
  { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
  { code: 'te-IN', label: 'తెలుగు', short: 'TE' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', short: 'KN' },
  { code: 'ml-IN', label: 'മലയാളം', short: 'ML' },
  { code: 'bn-IN', label: 'বাংলা', short: 'BN' },
  { code: 'mr-IN', label: 'मराठी', short: 'MR' },
  { code: 'en-IN', label: 'English', short: 'EN' },
];
