import type { Goal } from '../data/demo';
import type { VoiceLanguage } from './voice';

export type DetectedLanguage = 'tamil' | 'english' | 'tanglish' | 'mixed';
export type TeachingMode = 'learn' | 'steps' | 'ask' | 'check' | 'different';
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export type AssistantMemory = {
  language: DetectedLanguage;
  goal: Goal;
  currentStep: number;
  explained: string[];
  level: ExplanationLevel;
};

const tamilScript = /[\u0B80-\u0BFF]/;
const latinScript = /[A-Za-z]/;
const tanglishWords = /\b(enakku|epdi|eppadi|panradhu|panna|venum|irukku|ketta|solluren|puriyala|kidaikum|kidaikkum|theriyala|mudiyuma|irundhu|la)\b|\b\w+-(ku|la|aa|na)\b/i;

export const detectLanguage = (text: string): DetectedLanguage => {
  const hasTamil = tamilScript.test(text);
  const hasLatin = latinScript.test(text);
  if (hasTamil && hasLatin) return 'mixed';
  if (hasTamil) return 'tamil';
  if (tanglishWords.test(text)) return 'tanglish';
  return 'english';
};

export const languageLabel = (language: DetectedLanguage): string => {
  if (language === 'tamil') return 'தமிழ் detected ✓';
  if (language === 'tanglish') return 'Tanglish detected ✓';
  if (language === 'mixed') return 'Tamil + English detected ✓';
  return 'English detected ✓';
};

export const voiceLanguageFor = (language: DetectedLanguage, fallback: VoiceLanguage): VoiceLanguage => {
  if (language === 'english') return 'en-IN';
  if (language === 'tamil' || language === 'tanglish' || language === 'mixed') return 'ta-IN';
  return fallback;
};

export const goalFromText = (text: string, fallback: Goal): Goal => {
  const value = text.toLowerCase();
  if (/(voter|வாக்காளர்|aadhaar|ஆதார்|certificate|சான்றிதழ்|scheme|அரசு உதவி|government help)/i.test(value)) return 'help';
  if (/(study|learn|படிக்க|கற்க|course|lesson|கல்வி)/i.test(value)) return 'study';
  if (/(business|தொழில்|shop|கடை|வியாபாரம்)/i.test(value)) return 'business';
  if (/(skill|திறமை|தையல்|சமையல்|craft|கற்றுக்கொள்ள)/i.test(value)) return 'skill';
  if (/(work|வேலை|job|income|சம்பாதிக்க|வருமானம்)/i.test(value)) return 'income';
  return fallback;
};

const answerByLanguage = (language: DetectedLanguage, request: string, mode: TeachingMode, level: ExplanationLevel): string => {
  const value = request.toLowerCase();
  const isVoter = /(voter|வாக்காளர்)/i.test(value);
  const isScheme = /(scheme|அரசு உதவி|government help|women-ku)/i.test(value);
  if (language === 'english') {
    if (isVoter) return `Sure. Let’s learn this step by step.\n\nStep 1 → You should be 18 or older.\nStep 2 → We will check the official voter service.\nStep 3 → We will fill only the details you understand.\n\n“Eligibility” simply means: whether you are allowed to apply. Shall we check your age first?`;
    if (isScheme) return `Of course. We can look at support for women in a few simple groups: learning, work, business, and documents.\n\nStep 1 → Tell me what you want help with.\nStep 2 → We will check whether you are eligible.\nStep 3 → We will open only the official source.\n\nDo you want to learn, find work, start a business, or get a document?`;
    if (mode === 'different') return `Let me explain it another way. Think of this like learning to use a new phone: first we find the right button, then we try one small action, and only then do we move forward. What part feels confusing?`;
    if (mode === 'check') return `Quick check: in your own words, what is the first small step you want to take? There is no wrong answer.`;
    if (mode === 'learn') return `Let’s start from the basics. I’ll explain the idea in simple words, give you an example, and then you can try one small step. What would you like to learn?`;
    return `Sure. I understood that you want help with this. We’ll go one step at a time.\n\nStep 1 → We understand your goal.\nStep 2 → I explain the important word in simple language.\nStep 3 → You try the next action when you feel ready.\n\nWould you like a simple explanation or a more detailed one?`;
  }
  if (language === 'tanglish') {
    if (isVoter) return `Sure. Voter ID apply panna step-by-step paakalaam.\n\nStep 1 → Unga age 18+ irukkanum.\nStep 2 → Official voter service mattum check pannuvom.\nStep 3 → Purinja details mattum fill pannuvom.\n\n“Eligible” na apply panna ungaakku right irukka-nu artham. First unga age 18+ aa?`;
    if (isScheme) return `Kandippa. Women-ku kidaikkara help-ai learning, work, business, documents-nu categories-aa paakalaam.\n\nStep 1 → Unga goal enna-nu sollunga.\nStep 2 → Neenga eligible-aa-nu check pannuvom.\nStep 3 → Official source-la oru small step mattum seivom.\n\nLearning-aa, work-aa, business-aa, illa document help-aa?`;
    if (mode === 'different') return `Innum simple-aa solluren. Idhu new phone use panna kathukkaradhu maadhiri: first right button kandupidippom, next oru small action try pannuvom. Endha part confusing-aa irukku?`;
    if (mode === 'check') return `Chinna check: first step enna-nu unga words-la sollunga. Wrong answer-nu onnum illa.`;
    return `Sure. Naan unga question-a purinjukkitten. Namma one step at a time pogaலாம்.\n\nStep 1 → Unga goal-a purinjukkalaam.\nStep 2 → Difficult word-a simple-aa explain panren.\nStep 3 → Neenga ready-aa irukkumbodhu next action try pannalaam.\n\nSimple explanation venuma, illa konjam detail venuma?`;
  }
  if (isVoter) return `கண்டிப்பா. வாக்காளர் அட்டை எடுப்பதை step-by-step பார்க்கலாம்.\n\nStep 1 → முதலில் உங்கள் வயது 18+ இருக்கிறதா என்று பார்ப்போம்.\nStep 2 → அதிகாரப்பூர்வ voter service-ஐ மட்டும் சரிபார்ப்போம்.\nStep 3 → உங்களுக்குப் புரிந்த தகவல்களை மட்டும் நிரப்புவோம்.\n\n“Eligible” என்றால் விண்ணப்பிக்க உங்களுக்கு தகுதி இருக்கிறதா என்று பொருள். முதலில் உங்கள் வயதைச் சொல்ல விரும்புகிறீர்களா?`;
  if (isScheme) return `கண்டிப்பா. பெண்களுக்கு கிடைக்கக்கூடிய உதவிகளை learning, வேலை, business, documents என்று சில categories-ஆ பிரித்துப் பார்க்கலாம்.\n\nStep 1 → உங்களுக்கு என்ன தேவை என்று சொல்வோம்.\nStep 2 → நீங்கள் eligible-ஆ இருக்கிறீர்களா என்று பார்ப்போம்.\nStep 3 → official source-ல் ஒரு சிறிய படி மட்டும் செய்வோம்.\n\nLearning-ஆ, வேலை-ஆ, business-ஆ, அல்லது document help-ஆ?`;
  if (mode === 'different') return `இன்னும் சுலபமாகச் சொல்கிறேன். இது ஒரு புதிய phone கற்றுக்கொள்வது மாதிரி: முதலில் சரியான button-ஐ கண்டுபிடிப்போம், அடுத்து ஒரு சிறிய action try செய்வோம். எந்தப் பகுதி குழப்பமாக இருக்கிறது?`;
  if (mode === 'check') return `ஒரு சின்ன check: முதல் step என்ன என்று உங்கள் வார்த்தைகளில் சொல்ல முடியுமா? தவறான பதில் என்று எதுவும் இல்லை.`;
  if (mode === 'learn') return `முதலில் basics-லிருந்து தொடங்கலாம். நான் simple-ஆ explain பண்ணுவேன், ஒரு example சொல்வேன், பிறகு நீங்கள் ஒரு சிறிய step try செய்யலாம். என்ன கற்றுக்கொள்ள வேண்டும்?`;
  return `கண்டிப்பா. நீங்கள் என்ன செய்ய விரும்புகிறீர்கள் என்று புரிந்துகொண்டேன். நாம ஒரு படியாகச் செல்வோம்.\n\nStep 1 → உங்கள் goal-ஐப் புரிந்துகொள்வோம்.\nStep 2 → கடினமான வார்த்தையை simple-ஆ விளக்குவேன்.\nStep 3 → நீங்கள் ready-ஆ இருக்கும்போது அடுத்த action-ஐ try செய்யலாம்.\n\nSimple explanation வேண்டுமா, அல்லது கொஞ்சம் detail-ஆ வேண்டுமா?`;
};

export const createTeachingResponse = ({
  request,
  language,
  mode,
  level,
}: {
  request: string;
  language: DetectedLanguage;
  mode: TeachingMode;
  level: ExplanationLevel;
  goal: Goal;
}): string => {
  const response = answerByLanguage(language, request, mode, level);
  if (level === 'advanced' && language === 'english') return `${response}\n\nIf you want, I can also explain exceptions and the official source in more detail.`;
  if (level === 'intermediate' && language === 'tamil') return `${response}\n\nநீங்கள் விரும்பினால், அடுத்ததாக தேவையான documents-ஐயும் பார்ப்போம்.`;
  return response;
};
