/**
 * Creates natural voice recordings for every phrase card with ElevenLabs.
 *
 *   node scripts/gen-audio.mjs          # create any missing clips
 *   node scripts/gen-audio.mjs --voices # just list the voices on your account
 *
 * The API key is read from ~/.config/elevenlabs/key (or ELEVENLABS_API_KEY).
 * It is never written into this project. Existing clips are skipped, so
 * re-running only spends credits on new or deleted clips.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CARDS } from '../src/game/cards.ts';

const KEY_FILE = join(homedir(), '.config', 'elevenlabs', 'key');
const key = process.env.ELEVENLABS_API_KEY ?? (existsSync(KEY_FILE) ? readFileSync(KEY_FILE, 'utf8').trim() : '');
if (!key) {
  console.error(`No API key. Save it to ${KEY_FILE} first.`);
  process.exit(1);
}

const API = 'https://api.elevenlabs.io/v1';
const MODEL = 'eleven_multilingual_v2';
const OUT = new URL('../public/audio/', import.meta.url).pathname;

/**
 * Who speaks each place. First available name wins; if none exist on the
 * account, fall back to any American voice of the wanted gender.
 */
const CAST = {
  deli: { names: ['Chris', 'Eric', 'Liam'], gender: 'male', why: 'casual guy behind the counter' },
  subway: { names: ['Brian', 'Bill', 'Roger'], gender: 'male', why: 'announcer' },
  pharmacy: { names: ['Jessica', 'Sarah', 'Laura'], gender: 'female', why: 'pharmacist' },
  laundromat: { names: ['Eric', 'Will', 'Chris'], gender: 'male', why: 'laundromat attendant' },
  doctor: { names: ['Sarah', 'Matilda', 'Aria'], gender: 'female', why: 'calm doctor' },
  street: { names: ['Will', 'Liam', 'River'], gender: 'male', why: 'friendly neighbor' },
  maya: { names: ['Laura', 'Aria', 'Jessica'], gender: 'female', why: 'Maya, your rival' },
};

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key, ...(init.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText} on ${path}: ${body.slice(0, 300)}`);
  }
  return res;
}

const { voices } = await (await api('/voices')).json();
const american = (v) => /american/i.test(v.labels?.accent ?? '') || /american|us/i.test(v.labels?.description ?? '');

if (process.argv.includes('--voices')) {
  for (const v of voices) console.log(`${v.name.padEnd(12)} ${v.voice_id}  ${JSON.stringify(v.labels ?? {})}`);
  process.exit(0);
}

const chosen = {};
const used = new Set();
for (const [role, want] of Object.entries(CAST)) {
  const byName = want.names.map((n) => voices.find((v) => v.name.split(' ')[0] === n)).find((v) => v && !used.has(v.voice_id));
  const byLabel = voices.find((v) => american(v) && v.labels?.gender === want.gender && !used.has(v.voice_id));
  const pick = byName ?? byLabel ?? voices.find((v) => !used.has(v.voice_id)) ?? voices[0];
  if (!pick) throw new Error('No voices on this account.');
  // Maya must sound different from the place voices; places may share if the account has few voices.
  if (role === 'maya') used.add(pick.voice_id);
  chosen[role] = pick;
  console.log(`${role.padEnd(11)} → ${pick.name} (${want.why})`);
}

async function make(text, voice, file) {
  if (existsSync(file)) return false;
  const res = await api(`/text-to-speech/${voice.voice_id}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
  });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

mkdirSync(join(OUT, 'card'), { recursive: true });
mkdirSync(join(OUT, 'maya'), { recursive: true });

let made = 0;
let chars = 0;
for (const c of CARDS) {
  if (await make(c.target, chosen[c.place], join(OUT, 'card', `${c.id}.mp3`))) {
    made++;
    chars += c.target.length;
    process.stdout.write('.');
  }
  if (await make(c.target, chosen.maya, join(OUT, 'maya', `${c.id}.mp3`))) {
    made++;
    chars += c.target.length;
    process.stdout.write('.');
  }
}

// The game reads this to know which clips exist and to credit the voices.
writeFileSync(
  join(OUT, 'manifest.json'),
  JSON.stringify(
    {
      provider: 'ElevenLabs',
      model: MODEL,
      voices: Object.fromEntries(Object.entries(chosen).map(([r, v]) => [r, v.name])),
      cards: CARDS.map((c) => c.id),
    },
    null,
    2,
  ),
);
console.log(`\nMade ${made} clips (${chars} characters). Skipped the ones that already existed.`);
