export type VoiceLanguage = 'ta-IN' | 'hi-IN' | 'te-IN' | 'kn-IN' | 'ml-IN' | 'bn-IN' | 'mr-IN' | 'en-IN';

export const canReplayVoice = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

export const canRecognizeVoice = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

type SpeechCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

const findVoice = (lang: VoiceLanguage): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  const language = lang.toLowerCase().split('-')[0];
  return voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase())
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(language));
};

export const speakVoice = (text: string, lang: VoiceLanguage = 'ta-IN', callbacks: SpeechCallbacks = {}): (() => void) | null => {
  if (!canReplayVoice()) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.86;
  utterance.pitch = 1.05;
  const voice = findVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => callbacks.onEnd?.();
  utterance.onerror = () => callbacks.onError?.();
  window.speechSynthesis.speak(utterance);
  return () => window.speechSynthesis.cancel();
};

export const replayVoice = (text: string, lang: VoiceLanguage = 'ta-IN', callbacks: SpeechCallbacks = {}): boolean =>
  Boolean(speakVoice(text, lang, callbacks));

export const stopVoice = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
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
  onError: (reason?: string) => void,
  onEnd: () => void,
  onStart?: () => void,
): (() => void) | null => {
  if (!canRecognizeVoice()) return null;
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const recognition = new Recognition();
  let finished = false;
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onstart = () => onStart?.();
  recognition.onresult = (event) => {
    const text = event.results[0]?.[0]?.transcript?.trim();
    if (text) {
      finished = true;
      onText(text);
    }
  };
  recognition.onerror = (event) => {
    if (!finished) onError(event?.error);
  };
  recognition.onend = () => {
    if (!finished) onEnd();
  };
  try {
    recognition.start();
  } catch {
    onError('start');
    return null;
  }
  return () => {
    finished = true;
    try {
      recognition.stop();
    } catch {
      // The browser may already have ended recognition.
    }
  };
};

export const friendlyVoiceFallback = 'மன்னிக்கவும், உங்கள் குரலை கேட்க முடியவில்லை. மீண்டும் முயற்சி செய்யலாம்.';

export const stateCopy = {
  idle: { tamil: 'பேச தொடங்குங்கள்', english: 'Tap to talk' },
  waiting: { tamil: 'கேட்கத் தயாராக இருக்கிறேன்…', english: 'Ready when you are' },
  listening: { tamil: 'கேட்கிறேன்…', english: 'Listening to you' },
  understanding: { tamil: 'புரிந்துகொள்கிறேன்…', english: 'Processing your words' },
  speaking: { tamil: 'உங்களிடம் பேசுகிறேன்…', english: 'Speaking to you' },
  guiding: { tamil: 'அடுத்த படியை சொல்கிறேன்…', english: 'Here is your next step' },
  complete: { tamil: 'நன்றாக செய்தீர்கள்!', english: 'You did it!' },
  offline: { tamil: 'Internet connection இல்லை', english: 'You are offline' },
  error: { tamil: 'மன்னிக்கவும், மீண்டும் முயற்சி செய்யுங்கள்', english: 'I could not hear you' },
} as const;
