/**
 * Creates natural voice recordings with ElevenLabs for every phrase card,
 * every First Day scene line and every boss line.
 *
 *   npm run voices              # create any missing clips
 *   npm run voices -- --voices  # list the voices on your account
 *   npm run voices -- --dry     # show what would be made and the character count
 *   npm run voices -- --sample  # make only 3 sample clips to check the voices
 *
 * The API key is read from ~/.config/elevenlabs/key (or ELEVENLABS_API_KEY).
 * It is never written into this project. Existing clips are skipped, so
 * re-running only spends credits on new or deleted clips.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOSSES } from '../src/game/bosses.ts';
import { CARDS } from '../src/game/cards.ts';
import { SCENES } from '../src/game/firstday.ts';

const API = 'https://api.elevenlabs.io/v1';
const MODEL = 'eleven_multilingual_v2';
const OUT = fileURLToPath(new URL('../public/audio/', import.meta.url));
const args = new Set(process.argv.slice(2));

/**
 * Who speaks. First available name wins; otherwise any American voice of the
 * wanted gender. Card phrases are spoken by the voice of their place.
 */
const CAST = {
  // Places (phrase cards)
  deli: { names: ['Chris', 'Eric', 'Liam'], gender: 'male' },
  subway: { names: ['Brian', 'Bill', 'Roger'], gender: 'male' },
  pharmacy: { names: ['Jessica', 'Sarah', 'Laura'], gender: 'female' },
  laundromat: { names: ['Eric', 'Will', 'Chris'], gender: 'male' },
  doctor: { names: ['Sarah', 'Matilda', 'Aria'], gender: 'female' },
  street: { names: ['Will', 'Liam', 'River'], gender: 'male' },
  turnstile: { names: ['Jessica', 'Laura', 'Sarah'], gender: 'female' },
  platform: { names: ['Brian', 'Bill', 'Roger'], gender: 'male' },
  train: { names: ['Bill', 'Brian', 'George'], gender: 'male' },
  transfer: { names: ['Matilda', 'Sarah', 'Aria'], gender: 'female' },
  exit: { names: ['Will', 'Chris', 'Liam'], gender: 'male' },
  bus: { names: ['Eric', 'Roger', 'Chris'], gender: 'male' },
  // First Day characters
  'fd-taxi': { names: ['Roger', 'Bill', 'Chris'], gender: 'male' },
  'fd-subway': { names: ['Brian', 'Bill', 'George'], gender: 'male' },
  'fd-deli': { names: ['Jessica', 'Laura', 'Sarah'], gender: 'female' },
  'fd-home': { names: ['Bill', 'George', 'Roger'], gender: 'male' },
  'fd-neighbor': { names: ['Laura', 'Aria', 'Jessica'], gender: 'female' },
  'fd-boss': { names: ['Eric', 'Brian', 'Daniel'], gender: 'male' },
  // Bosses
  'boss-1': { names: ['Chris', 'Roger', 'Bill'], gender: 'male' },
  'boss-2': { names: ['Sarah', 'Matilda', 'Jessica'], gender: 'female' },
  // The rival
  maya: { names: ['Laura', 'Aria', 'Jessica'], gender: 'female' },
};

/** Everything to record: [voice role, file path under public/audio, text]. */
function jobs() {
  const list = [];
  for (const c of CARDS) {
    list.push([c.place, `card/${c.id}.mp3`, c.target]);
    list.push(['maya', `maya/${c.id}.mp3`, c.target]);
  }
  for (const s of SCENES) {
    s.variants.forEach((v, i) => {
      const level = s.task === 'talk' ? 1 : i + 1;
      list.push([`fd-${s.id}`, `card/fd-${s.id}-${level}.mp3`, v.line]);
    });
  }
  for (const [world, b] of Object.entries(BOSSES)) {
    b.rounds.forEach((r, i) => list.push([`boss-${world}`, `card/boss-${world}-${i}.mp3`, r.line]));
  }
  return list;
}

const all = jobs();
const missing = all.filter(([, file]) => !existsSync(join(OUT, file)));

if (args.has('--dry')) {
  const chars = missing.reduce((t, [, , text]) => t + text.length, 0);
  console.log(`${all.length} clips in total, ${missing.length} to make, ${chars} characters.`);
  process.exit(0);
}

const KEY_FILE = join(homedir(), '.config', 'elevenlabs', 'key');
const key = process.env.ELEVENLABS_API_KEY ?? (existsSync(KEY_FILE) ? readFileSync(KEY_FILE, 'utf8').trim() : '');
if (!key) {
  console.error(`No API key. Save it to ${KEY_FILE} first.`);
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key, ...(init.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText} on ${path}: ${body.slice(0, 300)}`);
  }
  return res;
}

const { voices } = await (await api('/voices')).json();
const american = (v) => /american/i.test(v.labels?.accent ?? '');

if (args.has('--voices')) {
  for (const v of voices) console.log(`${v.name.padEnd(12)} ${v.voice_id}  ${JSON.stringify(v.labels ?? {})}`);
  process.exit(0);
}

const chosen = {};
for (const [role, want] of Object.entries(CAST)) {
  const byName = want.names.map((n) => voices.find((v) => v.name.split(/[ -]/)[0] === n)).find(Boolean);
  const byLabel = voices.find((v) => american(v) && v.labels?.gender === want.gender) ?? voices.find((v) => v.labels?.gender === want.gender);
  const pick = byName ?? byLabel ?? voices[0];
  if (!pick) throw new Error('No voices on this account.');
  chosen[role] = pick;
}
console.log('Cast:', Object.entries(chosen).map(([r, v]) => `${r}=${v.name}`).join(', '));

async function make(role, file, text) {
  const out = join(OUT, file);
  if (existsSync(out)) return false;
  mkdirSync(dirname(out), { recursive: true });
  const res = await api(`/text-to-speech/${chosen[role].voice_id}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
  });
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  return true;
}

const todo = args.has('--sample')
  ? [
      all.find(([, f]) => f === 'card/fd-taxi-1.mp3'),
      all.find(([, f]) => f === 'card/deli-5.mp3'),
      all.find(([, f]) => f === 'card/boss-2-0.mp3'),
    ]
  : missing;

let made = 0;
let chars = 0;
for (const [role, file, text] of todo) {
  if (await make(role, file, text)) {
    made++;
    chars += text.length;
    process.stdout.write('.');
  }
}

if (!args.has('--sample')) {
  // The game reads this to know which clips exist and to credit the voices.
  const ids = all
    .filter(([, f]) => existsSync(join(OUT, f)) && f.startsWith('card/'))
    .map(([, f]) => f.slice(5, -4));
  writeFileSync(
    join(OUT, 'manifest.json'),
    JSON.stringify(
      { provider: 'ElevenLabs', model: MODEL, voices: Object.fromEntries(Object.entries(chosen).map(([r, v]) => [r, v.name])), cards: ids },
      null,
      2,
    ),
  );
}
console.log(`\nMade ${made} clips (${chars} characters).`);
