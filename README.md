# Speak & Move

A game for practising spoken English in real New York situations.

1. **Your First Day in New York**: six quick spoken scenes (taxi, subway, deli, landlord, neighbor, boss) that adapt as you go and measure your level.
2. **Player card**: a rank (Tourist → Legend) and five stats: Ear, Voice, Grammar, Words, Speed.
3. **World map**: Bodega Block and The Subway are playable; more worlds are coming.
4. **Board race vs Maya**: no dice. Pick Easy (+1), Medium (+2) or Hard (+3), say the phrase out loud, and move if you say it right. Cards that train your weakest stat come up more often.
5. **Boss battle**: answer the boss in English from the Bangla meaning, against a 20-second timer.
6. **Review deck** (back after 1, 3 and 7 days) and a **real-life mission** after each race.

### How it teaches (Learn → Practise → Use → Real life → Review)
- **Phrase Pack**: learn each world's 8 key phrases before racing; the boss uses them.
- **Mastery steps** per phrase: Say it → Fill the gap → From Bangla → Real talk. Right first time climbs a step; a miss drops one.
- **Second chances**: a missed phrase comes back 3 turns later in the same race.
- **Fix it "Why"** in English and Bangla, **tap a red word** to practise it alone, **Listen & answer** replies.
- **Boss hint ladder**: first words → key words → full answer.
- **Phrasebook** with mastery stars, **daily goal** and streak, **"How did it go?"** after real-life missions, and a **weekly check-up** showing stat changes.

Character art goes in `public/art/` (see the README there); placeholders show until it exists. Natural voices: `npm run voices` with an ElevenLabs key saved in `~/.config/elevenlabs/key`.

Voice checking uses the browser's built-in speech recognition (Chrome or Safari, https only). You can always type instead.

## Run locally

```bash
npm ci
npm run dev
```

## Test and build

```bash
npm test
npm run build
```

Pushing to `main` builds and deploys to GitHub Pages.
