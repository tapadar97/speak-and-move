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

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
