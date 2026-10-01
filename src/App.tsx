import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudOff,
  ExternalLink,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home,
  Info,
  Languages,
  LockKeyhole,
  Mic,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Type,
  Undo2,
  Users,
  Volume2,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { demoResource, goals, journeyItems, languageLabels, lessons, strengths, type Goal } from './data/demo';
import { DEMO_TRANSCRIPT, friendlyVoiceFallback, listenForSpeech, replayVoice, stateCopy, type VoiceLanguage } from './lib/voice';

type Screen = 'home' | 'journey' | 'school' | 'help' | 'privacy' | 'shield' | 'discovery';
type VoiceState = keyof typeof stateCopy;

type GoalIconProps = { icon: string };

const GoalIcon = ({ icon }: GoalIconProps) => {
  const common = { size: 18, strokeWidth: 2.1 };
  if (icon === 'briefcase') return <Zap {...common} />;
  if (icon === 'coins') return <Sparkles {...common} />;
  if (icon === 'book') return <BookOpen {...common} />;
  if (icon === 'spark') return <Sparkles {...common} />;
  if (icon === 'shop') return <HandHeart {...common} />;
  return <CircleHelp {...common} />;
};

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-hidden="true">
      <img src="/fesha-mark.svg" alt="" />
    </span>
  );
}

function StatusPill({ online }: { online: boolean }) {
  return (
    <span className={`status-pill ${online ? 'online' : 'offline'}`}>
      {online ? <Wifi size={13} /> : <WifiOff size={13} />}
      {online ? 'இணைப்பு உள்ளது' : 'Offline mode'}
    </span>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [demoStarted, setDemoStarted] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal>('income');
  const [selectedStrength, setSelectedStrength] = useState<(typeof strengths)[number] | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [quickHide, setQuickHide] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>('ta-IN');
  const [textSize, setTextSize] = useState(1);
  const [replayMessage, setReplayMessage] = useState<string | null>(null);
  const [requestText, setRequestText] = useState(DEMO_TRANSCRIPT);
  const [typedText, setTypedText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const timers = useRef<number[]>([]);
  const recognitionStop = useRef<(() => void) | null>(null);
  const safetyCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      timers.current.forEach(window.clearTimeout);
      recognitionStop.current?.();
    };
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
  };

  useEffect(() => {
    if (!showSafety) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSafety(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    schedule(() => safetyCloseRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showSafety]);

  const startListening = (goal: Goal = selectedGoal, request = DEMO_TRANSCRIPT) => {
    setSelectedGoal(goal);
    setRequestText(request);
    setScreen('home');
    setDemoStarted(true);
    setSelectedStrength(null);
    setGuideStep(0);
    setReplayMessage(null);
    setTypedText('');
    recognitionStop.current?.();
    recognitionStop.current = null;
    if (!isOnline) {
      setVoiceState('offline');
      return;
    }
    setVoiceState('waiting');
    schedule(() => {
      setVoiceState('listening');
      recognitionStop.current = listenForSpeech(selectedLanguage, setRequestText, () => setRequestText(friendlyVoiceFallback));
    }, 280);
    schedule(() => setVoiceState('understanding'), 1180);
    schedule(() => setVoiceState('guiding'), 2150);
  };

  const chooseGoal = (goal: Goal) => {
    if (goal === 'help') {
      setScreen('help');
      return;
    }
    startListening(goal);
  };

  const chooseStrength = (strength: (typeof strengths)[number]) => {
    setSelectedStrength(strength);
    setVoiceState('guiding');
    setGuideStep(0);
  };

  const advanceGuide = () => {
    if (guideStep >= 2) {
      setVoiceState('complete');
      return;
    }
    setGuideStep((current) => current + 1);
  };

  const resetDemo = () => {
    setDemoStarted(false);
    setSelectedStrength(null);
    setGuideStep(0);
    setVoiceState('idle');
    setScreen('home');
  };

  const replay = (text: string) => {
    const didReplay = replayVoice(text, selectedLanguage);
    setReplayMessage(didReplay ? 'குரல் மீண்டும் ஒலிக்கிறது' : 'இந்த phone-ல் voice replay கிடைக்கவில்லை. இதை படித்துப் பார்க்கலாம்.');
  };

  const submitTypedText = () => {
    const text = typedText.trim();
    if (!text) return;
    setShowTextInput(false);
    startListening('income', text);
  };

  const status = stateCopy[voiceState];
  const selectedLanguageLabel = languageLabels.find((language) => language.code === selectedLanguage)?.label ?? 'தமிழ்';
  const currentGuide = useMemo(() => {
    if (!selectedStrength) return null;
    const steps = [
      {
        eyebrow: 'STEP 1',
        title: 'இந்த இடத்தில் உங்கள் skill-ஐ தேர்வு செய்யுங்கள்',
        detail: 'FESHA முதலில் உங்களுக்கு பொருந்தும் ஒரு வழியை மட்டும் காட்டுகிறது.',
        target: 'Skill learning',
      },
      {
        eyebrow: 'STEP 2',
        title: 'இப்போது இந்த official source-ஐ பாருங்கள்',
        detail: 'இந்த resource அதிகாரப்பூர்வமானதா என்பதை Green Shield மூலம் சரிபார்க்கலாம்.',
        target: 'Official resource',
      },
      {
        eyebrow: 'STEP 3',
        title: 'தொடங்க இந்த button-ஐ அழுத்துங்கள்',
        detail: 'உங்களுக்கு தயாராக இருந்தால் மட்டும். FESHA உங்களுக்குப் பதிலாக submit செய்யாது.',
        target: 'Start learning',
      },
    ];
    return steps[guideStep];
  }, [guideStep, selectedStrength]);

  if (quickHide) {
    return (
      <main className="quick-hide-screen" aria-label="Private session quick hide">
        <div className="quick-hide-clock">
          <Clock3 size={28} />
          <time>{new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())}</time>
          <span>உங்கள் session மறைக்கப்பட்டுள்ளது</span>
          <button className="button button-light" onClick={() => setQuickHide(false)}>திரும்ப FESHA-க்கு</button>
        </div>
      </main>
    );
  }

  const renderHome = () => (
    <>
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> முதல் டிஜிட்டல் படி</span>
          <h1>வணக்கம் <span className="wave-hand">👋</span><br /><span className="hero-question">நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?</span></h1>
          <p className="hero-lede">உங்களுக்கு என்ன வேண்டும் என்று உங்கள் குரலில் சொல்லுங்கள். நான் ஒரு படியாக வழிகாட்டுகிறேன்.</p>
          <div className="hero-meta-row">
            <StatusPill online={isOnline} />
            <button className="text-button" onClick={() => setShowLanguage((value) => !value)}><Languages size={15} /> {selectedLanguageLabel} · 7 மொழிகள்</button>
          </div>
          {showLanguage && (
            <div className="language-popover" role="dialog" aria-label="Choose a language">
              <div className="popover-title">உங்கள் மொழியில் பேசுங்கள்</div>
              <div className="language-grid">
                {languageLabels.map((language) => <button key={language.code} className={`language-chip ${language.code === selectedLanguage ? 'selected' : ''}`} onClick={() => { setSelectedLanguage(language.code as VoiceLanguage); setShowLanguage(false); }}><strong>{language.short}</strong><span>{language.label}</span></button>)}
              </div>
              <p>FESHA உங்கள் குரலை தானாகப் புரிந்துகொள்ள முயற்சி செய்யும். மொழி: {selectedLanguageLabel}.</p>
            </div>
          )}
        </div>

        <div className="voice-stage">
          <div className={`voice-orbit ${voiceState === 'waiting' || voiceState === 'listening' || voiceState === 'understanding' ? 'active' : ''} ${voiceState === 'complete' ? 'complete' : ''}`}>
            <div className="orbit-dash" />
            <button className="voice-orb" onClick={() => startListening()} aria-label="பேசுங்கள் — Speak to FESHA">
              <span className="voice-orb-glow" />
              <Mic size={38} strokeWidth={1.9} />
              <span className="voice-orb-label">{voiceState === 'idle' || voiceState === 'offline' ? 'பேசுங்கள்' : voiceState === 'waiting' ? 'காத்திருக்கிறது' : voiceState === 'complete' ? 'முடிந்தது' : 'கேட்கிறேன்'}</span>
            </button>
            <div className="waveform" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          </div>
          <div className="voice-state" aria-live="polite">
            <strong>{status.tamil}</strong>
            <span>{status.english}</span>
          </div>
          {replayMessage && <span className="replay-note"><Volume2 size={13} /> {replayMessage}</span>}
        </div>
      </section>

      <section className="goal-section" aria-labelledby="goal-heading">
        <div className="section-heading-row"><div><span className="eyebrow">START HERE</span><h2 id="goal-heading">அல்லது, ஒன்றைத் தேர்வு செய்யலாம்</h2></div><span className="small-hint">ஒரு option மட்டும்</span></div>
        <div className="goal-grid">
          {goals.map((goal) => <button key={goal.id} className={`goal-card tone-${goal.tone} ${selectedGoal === goal.id && demoStarted ? 'chosen' : ''}`} onClick={() => chooseGoal(goal.id)}><span className="goal-icon"><GoalIcon icon={goal.icon} /></span><span><strong>{goal.tamil}</strong><small>{goal.label}</small></span><ChevronRight size={18} /></button>)}
        </div>
      </section>

      {demoStarted ? (
        <section className="conversation-card main-card" aria-live="polite">
          <div className="card-topline"><span className="card-kicker"><span className="live-dot" /> FESHA கேட்கிறது</span><button className="icon-button" onClick={() => replay(requestText)} aria-label="Replay voice"><Volume2 size={18} /></button></div>
          <div className="detected-language"><Languages size={14} /> மொழி கண்டறியப்பட்டது · {selectedLanguageLabel}</div>
          <div className="transcript-bubble"><span className="avatar user-avatar">நீ</span><p>{requestText}</p></div>
          {voiceState === 'waiting' && <div className="waiting-state"><span className="mini-loader" /><p>உங்கள் குரலுக்காக காத்திருக்கிறேன்…</p></div>}
          {voiceState === 'understanding' && <div className="understanding-state"><span className="mini-loader" /><p>உங்கள் வார்த்தைகளின் அர்த்தத்தைப் புரிந்துகொள்கிறேன்…</p></div>}
          {voiceState === 'offline' && <div className="offline-card"><CloudOff size={23} /><div><strong>இந்த படிக்கு internet connection தேவைப்படுகிறது.</strong><span>கவலை வேண்டாம். இந்த demo-வை connection வந்தவுடன் தொடரலாம்.</span></div><button className="button button-outline" onClick={() => startListening()}>மீண்டும் முயற்சி</button></div>}
          {voiceState === 'guiding' && !selectedStrength && <div className="question-block"><div className="fesha-bubble"><BrandMark small /><div><strong>நிச்சயமாக. உங்களுக்கு ஏற்கனவே தெரிந்த ஒரு திறமையிலிருந்து தொடங்கலாம்.</strong><span>உங்களுக்கு எதில் ஆர்வம் இருக்கிறது?</span></div></div><div className="strength-grid">{strengths.map((strength) => <button key={strength.id} className="strength-card" onClick={() => chooseStrength(strength)}><span className="strength-emoji">{strength.emoji}</span><span><strong>{strength.tamil}</strong><small>{strength.english}</small></span><ArrowRight size={16} /></button>)}</div></div>}
          {voiceState === 'guiding' && selectedStrength && currentGuide && <div className="guide-block"><div className="guide-intro"><span className="step-count">{currentGuide.eyebrow}</span><h3>உங்களுக்கு {selectedStrength.tamil} பிடிக்கும் என்று புரிந்துகொண்டேன்.</h3><p>{currentGuide.detail}</p></div><div className="guide-visual"><span className="pointer-ring" /><div className="guide-target"><ShieldCheck size={19} /><span>{currentGuide.target}</span></div><span className="guide-pointer"><ArrowRight size={16} /> இங்கே பாருங்கள்</span></div><button className="button button-primary button-wide" onClick={advanceGuide}>{guideStep === 0 ? 'என்னை வழிநடத்து' : guideStep >= 2 ? 'முடித்துவிட்டேன்' : 'அடுத்த படி'} <ArrowRight size={18} /></button><button className="audio-link" onClick={() => replay(currentGuide.title)}><Volume2 size={15} /> இதை கேட்க</button></div>}
          {voiceState === 'complete' && <div className="win-block"><div className="win-spark">✦</div><span className="eyebrow">FIRST DIGITAL WIN</span><h3>முதல் டிஜிட்டல் படி முடிந்தது!</h3><p>இதை நீங்கள் செய்தீர்கள். அடுத்த முறை FESHA கொஞ்சம் குறைவாக உதவும்.</p><div className="win-actions"><button className="button button-primary" onClick={() => setScreen('journey')}>என் Journey <ArrowRight size={17} /></button><button className="text-button" onClick={resetDemo}><Undo2 size={15} /> மீண்டும் தொடங்கு</button></div></div>}
        </section>
      ) : (
        <>
          <section className="empty-prompt main-card"><div className="empty-prompt-icon"><Mic size={21} /></div><div><strong>Try saying…</strong><p>“எனக்கு வீட்டிலிருந்து சம்பாதிக்க வேண்டும்.”</p></div><button className="button button-soft" onClick={() => startListening('income')}>கேட்கலாம் <ArrowRight size={16} /></button></section>
          {showTextInput && <section className="type-fallback main-card"><div><span className="eyebrow">TEXT FALLBACK</span><h3>Type செய்து சொல்லலாம்.</h3></div><div className="type-row"><input value={typedText} onChange={(event) => setTypedText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitTypedText()} placeholder="என்ன செய்ய வேண்டும் என்று எழுதுங்கள்" aria-label="Type what you need" /><button className="button button-primary" onClick={submitTypedText}>தொடரலாம் <ArrowRight size={16} /></button></div></section>}
        </>
      )}

      <div className="home-lower-grid">
        <button className="shield-card main-card" onClick={() => setScreen('shield')}><div className="card-topline"><span className="card-kicker"><ShieldCheck size={16} /> GREEN SHIELD</span><ChevronRight size={17} /></div><h3>நம்பகமான இடத்திற்கே வழிகாட்டுகிறேன்.</h3><p>Link, source, last checked — எல்லாம் உங்களுக்குத் தெளிவாகத் தெரியும்.</p><div className="shield-source"><span className="shield-check"><Check size={14} /></span><span><strong>Official source checked</strong><small>Skill India Digital · 01 Oct 2026</small></span></div></button>
        <button className="journey-card main-card" onClick={() => setScreen('journey')}><div className="card-topline"><span className="card-kicker"><Sparkles size={16} /> MY JOURNEY</span><ChevronRight size={17} /></div><div className="journey-number">3 <span>/ 5 things I can do now</span></div><div className="progress-bar"><span style={{ width: '60%' }} /></div><p>நீங்கள் ஏற்கனவே முன்னேறுகிறீர்கள்.</p></button>
      </div>
      <button className="discovery-teaser main-card" onClick={() => setScreen('discovery')}><span className="discovery-teaser-icon"><Search size={19} /></span><span><strong>உங்கள் strengths-ஐ கண்டுபிடிக்கலாம்</strong><small>What do you enjoy? What would you like to learn?</small></span><ChevronRight size={18} /></button>
    </>
  );

  const renderJourney = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon mint"><Sparkles size={21} /></span><div><span className="eyebrow">MY JOURNEY</span><h1>நான் இப்போது செய்யக்கூடியவை</h1><p>சிறிய படிகள் சேர்ந்து பெரிய சுதந்திரமாகும்.</p></div></div><div className="journey-feature-card"><div className="journey-feature-top"><div><span className="eyebrow">INDEPENDENCE, NOT SCORES</span><h2>நீங்கள் செய்தது தெரிகிறது.</h2></div><div className="journey-ring"><strong>3</strong><span>of 5</span></div></div><div className="journey-list">{journeyItems.map((item) => <div className={`journey-row ${item.complete ? 'done' : ''}`} key={item.label}><span className="journey-check">{item.complete ? <Check size={15} /> : <span />}</span><span>{item.label}</span>{item.complete && <small>முடிந்தது</small>}</div>)}</div></div><div className="two-column-cards"><div className="info-card"><div className="card-kicker"><HeartHandshake size={16} /> ASSISTANCE REDUCTION</div><h3>அடுத்த முறை நான் கொஞ்சம் குறைவாக உதவுவேன்.</h3><p>FESHA உங்கள் சார்பாக முடிவு செய்யாது. உங்களால் தனியாக செய்ய முடியும் என்று நம்பிக்கை கொடுக்கும்.</p></div><div className="info-card warm"><div className="card-kicker"><SunMedium size={16} /> FIRST DIGITAL WINS</div><h3>இந்த மாதம் 1 சிறிய வெற்றி</h3><p>ஒரு official source-ஐ அடையாளம் காண முடிந்தது.</p></div></div></section>;

  const renderSchool = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon gold"><GraduationCap size={21} /></span><div><span className="eyebrow">DIGITAL CONFIDENCE SCHOOL</span><h1>Teach me my phone</h1><p>Explain → Show → Try → Encourage → Complete</p></div></div><div className="school-callout"><div className="school-callout-icon"><BookOpen size={23} /></div><div><strong>இன்று ஒரு lesson மட்டும் போதும்.</strong><p>நீங்கள் விரும்பும் நேரத்தில் நிறுத்தலாம். நாளை மீண்டும் தொடங்கலாம்.</p></div><button className="icon-button" aria-label="Play introduction"><Play size={18} /></button></div><div className="lesson-list">{lessons.map((lesson, index) => <button className={`lesson-row ${lesson.complete ? 'complete' : ''}`} key={lesson.title} onClick={() => index === 2 && setScreen('shield')}><span className="lesson-number">{lesson.complete ? <Check size={16} /> : index + 1}</span><span className="lesson-icon">{lesson.icon === 'shield' ? <ShieldCheck size={19} /> : lesson.icon === 'lock' ? <LockKeyhole size={19} /> : <BookOpen size={19} />}</span><span className="lesson-copy"><strong>{lesson.title}</strong><small>{lesson.subtitle}</small></span><small className="lesson-duration">{lesson.duration}</small><ChevronRight size={17} /></button>)}</div></section>;

  const renderHelp = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon coral"><HeartHandshake size={21} /></span><div><span className="eyebrow">YOU ARE NOT ALONE</span><h1>உதவி வேண்டும் என்றால் சொல்லுங்கள்.</h1><p>FESHA புரியவில்லை என்றாலும், உங்கள் அடுத்த வழி இருக்கும்.</p></div></div><div className="help-fallback main-card"><div className="help-fallback-top"><div className="help-avatar"><BrandMark /></div><div><span className="eyebrow">WHEN I DON’T UNDERSTAND</span><h2>{friendlyVoiceFallback}</h2></div></div><div className="help-options"><button onClick={() => startListening()}><Mic size={19} /><span><strong>Speak again</strong><small>மீண்டும் பேசலாம்</small></span><ChevronRight size={17} /></button><button onClick={() => { setScreen('home'); setShowTextInput(true); }}><Type size={19} /><span><strong>Type instead</strong><small>Type செய்து சொல்லலாம்</small></span><ChevronRight size={17} /></button><button onClick={() => setScreen('home')}><CircleHelp size={19} /><span><strong>Choose what I need</strong><small>ஒரு option தேர்வு செய்யலாம்</small></span><ChevronRight size={17} /></button></div></div><div className="trusted-card"><div className="trusted-icon"><Users size={23} /></div><div><span className="eyebrow">PEER ASSIST</span><h3>நம்பும் ஒருவரிடமிருந்து உதவி பெறுங்கள்.</h3><p>ASHA worker, SHG leader, authorized community worker அல்லது நம்பும் குடும்ப உறுப்பினர்.</p><button className="button button-primary">Trusted help தேடுங்கள் <ArrowRight size={17} /></button></div></div><button className="discovery-teaser main-card" onClick={() => setScreen('discovery')}><span className="discovery-teaser-icon"><Search size={19} /></span><span><strong>Women Skill Discovery</strong><small>உங்கள் விருப்பம், skill மற்றும் நேரத்திலிருந்து தொடங்கலாம்</small></span><ChevronRight size={18} /></button></section>;

  const renderDiscovery = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon mint"><Search size={21} /></span><div><span className="eyebrow">WOMEN SKILL DISCOVERY</span><h1>உங்கள் பலம் எதில் இருக்கிறது?</h1><p>இது examination இல்லை. உங்களைப் பற்றி மெதுவாகப் புரிந்துகொள்வோம்.</p></div></div><div className="discovery-card main-card"><div className="discovery-question"><span className="step-count">ONE SIMPLE QUESTION</span><h2>நீங்கள் எதை enjoy செய்கிறீர்கள்?</h2><div className="discovery-choices"><button>மக்களுடன் பேசுவது</button><button>கைகளால் செய்வது</button><button>புதியதை கற்றுக்கொள்வது</button><button>வீட்டிலிருந்து செய்வது</button></div></div><div className="strength-summary"><span className="eyebrow">YOUR STRENGTHS</span><div className="strength-summary-grid">{strengths.slice(0, 4).map((strength) => <div key={strength.id}><span>{strength.emoji}</span><strong>{strength.tamil}</strong></div>)}</div><p>அடுத்த கேள்வியில், உங்களுக்கு எவ்வளவு நேரம் இருக்கிறது மற்றும் வேலை வேண்டுமா business வேண்டுமா என்று கேட்பேன்.</p><button className="button button-primary" onClick={() => startListening('income')}>என் next step பார்க்கலாம் <ArrowRight size={17} /></button></div></div></section>;

  const renderPrivacy = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon ink"><LockKeyhole size={21} /></span><div><span className="eyebrow">PRIVATE SESSION</span><h1>இந்த phone-ஐ மற்றவர்களும் பயன்படுத்துகிறார்களா?</h1><p>உங்கள் goals மற்றும் temporary session தகவல்களை குறைவாகவே வைத்திருக்கிறோம்.</p></div></div><div className="privacy-card"><div className="privacy-header"><div className="privacy-icon"><LockKeyhole size={24} /></div><div><h2>உங்கள் privacy முதலில்.</h2><p>FESHA உங்கள் passwords, OTPs அல்லது documents-ஐ கேட்காது.</p></div></div><div className="privacy-points"><div><Check size={17} /><span>சேமிக்க வேண்டிய தனிப்பட்ட தகவல் இல்லை</span></div><div><Check size={17} /><span>Temporary session மட்டும்</span></div><div><Check size={17} /><span>Quick Hide மூலம் உடனே மறைக்கலாம்</span></div></div><button className="button button-dark button-wide" onClick={() => setQuickHide(true)}><Clock3 size={17} /> Quick Hide — neutral screen</button></div><div className="text-size-card"><div><Type size={18} /><strong>எழுத்தின் அளவு</strong></div><div className="text-size-actions"><button className={textSize === 0 ? 'active' : ''} onClick={() => setTextSize(0)}>A</button><button className={textSize === 1 ? 'active' : ''} onClick={() => setTextSize(1)}>A</button><button className={textSize === 2 ? 'active' : ''} onClick={() => setTextSize(2)}>A</button></div></div></section>;

  const renderShield = () => <section className="surface-page"><div className="surface-heading"><span className="surface-icon green"><ShieldCheck size={21} /></span><div><span className="eyebrow">GREEN SHIELD</span><h1>முதலில் சரிபார்ப்போம்.</h1><p>ஒரு link safe-ஆ என்று FESHA ஒருபோதும் ஊகிக்காது.</p></div></div><div className="resource-card"><div className="resource-header"><div className="verified-seal"><ShieldCheck size={25} /><span>VERIFIED</span></div><div><span className="eyebrow">RESOURCE REGISTRY</span><h2>{demoResource.name}</h2><p>{demoResource.category} · {demoResource.location}</p></div></div><div className="resource-grid"><div><span>Purpose</span><strong>{demoResource.purpose}</strong></div><div><span>Verified source</span><strong>{demoResource.source}</strong></div><div><span>Last checked</span><strong>{demoResource.verifiedOn}</strong></div><div><span>Supported languages</span><strong>{demoResource.languages.join(' · ')}</strong></div><div><span>Required documents</span><strong>{demoResource.documents.join(' · ')}</strong></div><div><span>How to apply</span><strong>{demoResource.method}</strong></div></div><a className="resource-url" href={demoResource.url} target="_blank" rel="noreferrer"><ShieldCheck size={15} /><span>{demoResource.url}</span><ExternalLink size={15} /></a><div className="resource-note"><Info size={17} /><span>{demoResource.eligibility}</span></div><div className="redirect-warning"><Info size={17} /><span><strong>Redirect suspicious-ஆ இருந்தால் நிறுத்துங்கள்.</strong> Address மாறினால், back சென்று official source-ஐ மீண்டும் சரிபார்க்கலாம்.</span></div></div><div className="stop-card"><div className="stop-top"><span className="stop-icon"><Pause size={17} /></span><div><span className="eyebrow">ZERO-SUBMIT SAFEGUARD</span><h2>OTP அல்லது PIN கேட்டால் நிறுத்துவோம்.</h2></div></div><p>FESHA உங்கள் OTP, password, UPI PIN, ATM PIN, card PIN, banking credentials, unexpected payment அல்லது unnecessary sensitive information-ஐ ஒருபோதும் submit செய்யாது.</p><button className="button button-coral button-wide" onClick={() => setShowSafety(true)}>Stop screen-ஐ பார்க்கலாம் <ArrowRight size={17} /></button></div></section>;

  const renderSurface = () => {
    if (screen === 'journey') return renderJourney();
    if (screen === 'school') return renderSchool();
    if (screen === 'help') return renderHelp();
    if (screen === 'privacy') return renderPrivacy();
    if (screen === 'discovery') return renderDiscovery();
    return renderShield();
  };

  return (
    <div className={`app-shell size-${textSize}`}>
      <header className="topbar">
        <button className="brand-button" onClick={() => setScreen('home')} aria-label="Go to FESHA home"><BrandMark /><span className="wordmark">FESHA</span><span className="brand-tagline">HER FIRST STEP</span></button>
        <div className="topbar-actions"><StatusPill online={isOnline} /><button className="private-button" onClick={() => setScreen('privacy')}><LockKeyhole size={15} /> Private session</button><button className="quick-hide-button" onClick={() => setQuickHide(true)} aria-label="Quick hide"><Clock3 size={17} /></button></div>
      </header>
      <main className="page-shell">{screen === 'home' ? renderHome() : <><button className="back-link" onClick={() => setScreen('home')}><ArrowLeft size={16} /> Home</button>{renderSurface()}</>}</main>
      <nav className="bottom-nav" aria-label="FESHA sections"><button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><Home size={19} /><span>Home</span></button><button className={screen === 'journey' ? 'active' : ''} onClick={() => setScreen('journey')}><Sparkles size={19} /><span>Journey</span></button><button className={screen === 'school' ? 'active' : ''} onClick={() => setScreen('school')}><GraduationCap size={19} /><span>Learn</span></button><button className={screen === 'help' ? 'active' : ''} onClick={() => setScreen('help')}><HeartHandshake size={19} /><span>Help</span></button><button className={screen === 'privacy' ? 'active' : ''} onClick={() => setScreen('privacy')}><LockKeyhole size={19} /><span>Private</span></button></nav>
      {showSafety && <div className="modal-backdrop" role="presentation"><section className="safety-modal" role="dialog" aria-modal="true" aria-labelledby="safety-title"><button ref={safetyCloseRef} className="modal-close" onClick={() => setShowSafety(false)} aria-label="Close"><X size={19} /></button><div className="safety-icon"><Pause size={24} /></div><span className="eyebrow coral-text">STOP — CHECK THIS FIRST</span><h2 id="safety-title">எச்சரிக்கை! உங்கள் OTP அல்லது PIN-ஐ யாரிடமும் பகிர வேண்டாம்.</h2><p>இந்த screen-ல் FESHA guided workflow-ஐ நிறுத்துகிறது. OTP, password, UPI PIN, unexpected payment அல்லது unnecessary sensitive information கேட்டால் தொடர வேண்டாம்.</p><div className="safety-actions"><button className="button button-soft" onClick={() => setShowSafety(false)}><Undo2 size={17} /> Go back</button><button className="button button-coral" onClick={() => { setShowSafety(false); setScreen('shield'); }}><ShieldCheck size={17} /> Check official source</button></div></section></div>}
    </div>
  );
}

export default App;
