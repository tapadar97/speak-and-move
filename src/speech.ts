/* Thin wrappers around the browser's built-in speech recognition and voices. */

// The Web Speech API isn't in TypeScript's DOM types everywhere, so keep it loose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Recognition = any;

function Ctor(): (new () => Recognition) | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const canListen = () => typeof window !== 'undefined' && Ctor() !== null;

export type ListenError = 'mic-blocked' | 'no-speech' | 'network' | 'unsupported' | 'other';

export interface ListenHandlers {
  onInterim: (text: string) => void;
  /** All the recogniser's guesses for what was said. */
  onResult: (alternatives: string[]) => void;
  onError: (e: ListenError) => void;
  onEnd: () => void;
}

/** Start listening for one phrase. Returns a function that stops early. */
export function listen(h: ListenHandlers): () => void {
  const C = Ctor();
  if (!C) {
    h.onError('unsupported');
    h.onEnd();
    return () => {};
  }
  const rec: Recognition = new C();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;
  let gotFinal = false;

  rec.onresult = (e: Recognition) => {
    const last = e.results[e.results.length - 1];
    if (last.isFinal) {
      gotFinal = true;
      const alts: string[] = [];
      for (let i = 0; i < last.length; i++) alts.push(last[i].transcript);
      h.onResult(alts);
    } else {
      h.onInterim(last[0].transcript);
    }
  };
  rec.onerror = (e: Recognition) => {
    const code: string = e.error;
    if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') h.onError('mic-blocked');
    else if (code === 'no-speech') h.onError('no-speech');
    else if (code === 'network') h.onError('network');
    else if (code !== 'aborted') h.onError('other');
  };
  rec.onend = () => {
    if (!gotFinal) h.onInterim('');
    h.onEnd();
  };
  try {
    rec.start();
  } catch {
    h.onError('other');
    h.onEnd();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  };
}

export interface LongHandlers {
  /** Everything heard so far (finished parts plus the part being spoken). */
  onText: (text: string) => void;
  onError: (e: ListenError) => void;
  onEnd: () => void;
}

/** Keep listening across pauses (free talk). Returns a function that stops. */
export function listenLong(h: LongHandlers, startText = ''): () => void {
  const C = Ctor();
  if (!C) {
    h.onError('unsupported');
    h.onEnd();
    return () => {};
  }
  const rec: Recognition = new C();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = true;
  let done = startText;
  rec.onresult = (e: Recognition) => {
    let live = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) done = `${done} ${r[0].transcript}`.trim();
      else live += r[0].transcript;
    }
    h.onText(`${done} ${live}`.trim());
  };
  rec.onerror = (e: Recognition) => {
    const code: string = e.error;
    if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') h.onError('mic-blocked');
    else if (code === 'network') h.onError('network');
    else if (code !== 'aborted' && code !== 'no-speech') h.onError('other');
  };
  rec.onend = () => h.onEnd();
  try {
    rec.start();
  } catch {
    h.onError('other');
    h.onEnd();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  };
}

let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (voice) return voice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const us = voices.filter((v) => v.lang === 'en-US' || v.lang === 'en_US');
  voice =
    us.find((v) => /samantha|google us english|aria|jenny/i.test(v.name)) ??
    us.find((v) => v.localService) ??
    us[0] ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
  return voice;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voice = null;
    pickVoice();
  };
}

export const canSpeak = () => typeof window !== 'undefined' && !!window.speechSynthesis;

/** Say a phrase out loud. `rate` 1 is normal, 0.6 is slow. */
export function speak(text: string, rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const v = pickVoice();
    if (v) u.voice = v;
    // Some browsers never fire onend (no voices installed), so never wait forever.
    const guard = window.setTimeout(resolve, 1500 + (text.length * 90) / rate);
    const done = () => {
      window.clearTimeout(guard);
      resolve();
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  });
}

/* ---------- Natural recordings (ElevenLabs), with the phone voice as backup ---------- */

interface Manifest {
  voices: Record<string, string>;
  cards: string[];
}

let manifest: Promise<Manifest | null> | null = null;
let current: HTMLAudioElement | null = null;

/** Which recordings exist. Missing or broken manifest means "use the phone voice". */
export function loadManifest(): Promise<Manifest | null> {
  manifest ??= fetch('audio/manifest.json')
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
    .catch(() => null);
  return manifest;
}

if (typeof window !== 'undefined') loadManifest();

function playFile(url: string, rate: number): Promise<boolean> {
  return new Promise((resolve) => {
    const a = new Audio(url);
    current = a;
    a.playbackRate = rate;
    // Keep the speaker's natural pitch when slowed down.
    a.preservesPitch = true;
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    a.play().catch(() => resolve(false));
  });
}

/**
 * Play a phrase in a natural voice: the place's voice (`card`) or Maya's.
 * `rate` 1 is normal, below 0.8 is slow. Falls back to the phone voice.
 */
export async function sayPhrase(cardId: string, text: string, who: 'card' | 'maya', rate = 1): Promise<void> {
  stopSpeaking();
  const m = await loadManifest();
  if (m?.cards.includes(cardId)) {
    const clipRate = rate < 0.8 ? 0.72 : rate < 0.95 ? 0.9 : 1;
    if (await playFile(`audio/${who}/${cardId}.mp3`, clipRate)) return;
  }
  await speak(text, rate);
}

export function stopSpeaking() {
  if (current) {
    current.pause();
    current = null;
  }
  if (canSpeak()) window.speechSynthesis.cancel();
}
