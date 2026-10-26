# Speak & Move

A game for practising spoken English in real New York situations.

1. **Your First Day in New York**: six quick spoken scenes (taxi, subway, deli, landlord, neighbor, boss) that adapt as you go and measure your level.
2. **Player card**: a rank (Tourist → Legend) and five stats: Ear, Voice, Grammar, Words, Speed.
3. **World map**: Bodega Block and The Subway are playable; more worlds are coming.
4. **Board race vs Maya**: no dice. Pick Easy (+1), Medium (+2) or Hard (+3), say the phrase out loud, and move if you say it right. Cards that train your weakest stat come up more often.
5. **Boss battle**: answer the boss in English from the Bangla meaning, against a 20-second timer.
6. **Review deck** (back after 1, 3 and 7 days) and a **real-life mission** after each race.

Character art goes in `public/art/` (see the README there); placeholders show until it exists. Natural voices: `node scripts/gen-audio.mjs` with an ElevenLabs key saved in `~/.config/elevenlabs/key`.

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
