export type VoiceLanguage = 'ta-IN' | 'hi-IN' | 'te-IN' | 'kn-IN' | 'ml-IN' | 'bn-IN' | 'mr-IN' | 'en-IN';

export const DEMO_TRANSCRIPT = 'எனக்கு சம்பாதிக்க வேண்டும். ஆனால் என்ன செய்வது என்று தெரியவில்லை.';

export const canReplayVoice = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export const canRecognizeVoice = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

export const replayVoice = (text: string, lang: VoiceLanguage = 'ta-IN'): boolean => {
  if (!canReplayVoice()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.86;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
  return true;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const listenForSpeech = (
  lang: VoiceLanguage,
  onText: (text: string) => void,
  onError: () => void,
  onEnd: () => void,
): (() => void) | null => {
  if (!canRecognizeVoice()) return null;
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const recognition = new Recognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const text = event.results[0]?.[0]?.transcript?.trim();
    if (text) onText(text);
  };
  recognition.onerror = onError;
  recognition.onend = onEnd;
  try {
    recognition.start();
  } catch {
    onError();
    return null;
  }
  return () => recognition.stop();
};

export const friendlyVoiceFallback = 'பரவாயில்லை. இன்னொரு முறை முயற்சி செய்யலாம்.';

export const stateCopy = {
  idle: { tamil: 'உங்கள் குரலில் சொல்லுங்கள்', english: 'Tell FESHA what you need' },
  waiting: { tamil: 'நான் காத்திருக்கிறேன்…', english: 'Ready when you are' },
  listening: { tamil: 'நான் கேட்கிறேன்…', english: 'Listening to you' },
  understanding: { tamil: 'நான் புரிந்துகொள்கிறேன்…', english: 'Understanding your words' },
  guiding: { tamil: 'அடுத்த படியை சொல்கிறேன்…', english: 'Here is your next step' },
  complete: { tamil: 'நன்றாக செய்தீர்கள்!', english: 'You did it!' },
  offline: { tamil: 'Internet connection இல்லை', english: 'You are offline' },
} as const;
