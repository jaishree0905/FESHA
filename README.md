# FESHA — Her Voice. Her Choice. Her First Step.

FESHA is a voice-first, multilingual learning and guidance companion for women. It helps users ask questions naturally, understand one small next step, and continue through a calm, accessible interface.

## Highlights

- Tamil, English, Tanglish, and mixed-language assistant responses
- Real browser speech recognition when supported
- Voice states for listening, processing, speaking, stopping, and errors
- Automatic text-to-speech responses with Tamil voice selection when available
- Typed-input fallback using the same assistant logic
- Step-by-step teaching modes, explanation depth controls, and session memory
- Rose-red visual identity with responsive mobile and desktop layouts
- Official-resource guidance and privacy-focused private-session UX

## Run locally

Requirements: Node.js 22+ and pnpm 11+

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

## Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

The production output is written to `dist/`.

## Voice support

FESHA uses the browser Web Speech APIs when available:

- `SpeechRecognition` / `webkitSpeechRecognition` for microphone input
- `speechSynthesis` for spoken responses

The browser must grant microphone permission for voice input. If speech recognition is unavailable or permission is denied, typed questions remain available as the fallback.

## Project structure

- `src/App.tsx` — application shell, assistant journeys, and UI state
- `src/lib/assistant.ts` — language detection and teaching responses
- `src/lib/voice.ts` — speech recognition and text-to-speech adapters
- `src/data/demo.ts` — demo goals, lessons, strengths, and resource data
- `src/styles.css` — responsive rose visual system
- `public/` — brand assets, manifest, favicon, and route manifest

## Safety and secrets

No API keys or runtime secrets are required by this browser-only demo. Do not commit `.env` files, credentials, tokens, or passwords.
