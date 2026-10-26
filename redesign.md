# Speak & Move: Redesign for real improvement

26 October 2026 · BUX stages: QA (audit) → Root cause → Opportunity → TO-BE → Screen changes → KPI
Scope: **how much your English improves**, not saving clicks. No AI agent.

---

## 1. Goal

**Business / product goal:** players speak better English in real New York situations, and keep playing long enough to get there.
**Player goal:** "I want to understand people and answer without freezing."
**Problem statement:** The game currently **tests** English more than it **teaches** it. Players are asked to say things they were never taught, get little explanation when wrong, and mostly read text aloud, so improvement is slower than it could be.

---

## 2. AS-IS: how a player learns today

| Step | What happens | Evidence |
|---|---|---|
| 1. First Day | 6 scenes, one try each, no teaching | `firstday.ts` |
| 2. Player card | Rank + 5 stats + one quest | `CharacterCard.tsx` |
| 3. Race vs Maya | Pick Easy/Medium/Hard → card → speak → move | `Game.tsx` |
| 4. Card types | **Say it 37 (44%)**, Listen 24 (28%), Fix it 12 (14%), From Bangla 12 (14%) | card count |
| 5. Wrong answer | Red words, hear it, **one** retry, then saved to review | `CardSheet.tsx` |
| 6. Boss | Say an exact English sentence from Bangla, 20 s, 1 full hint | `bosses.ts` |
| 7. Review | Missed phrases return after 1, 3, 7 days | `review.ts` |
| 8. Real-life mission | "Say this at the deli" → tap "I said it" | `MapScreen.tsx` |

**Baseline:** none yet. The game doesn't record per-phrase progress over time. **Measurement required.**

---

## 3. Root causes (what limits improvement)

| # | Where | Pain point | Root cause | Impact on learning |
|---|---|---|---|---|
| R1 | Boss, From Bangla cards | Asked to say sentences you were **never shown** | No "learn" step before "use" | Failing feels unfair; you guess instead of learn |
| R2 | 44% of cards | Mostly **reading aloud** | Card mix favours the easiest activity | Reading ≠ remembering; little carries into real talk |
| R3 | Fix it cards | Shows *what* is wrong, never *why* | No explanation field | Same mistake repeats in new sentences |
| R4 | Red words | Can't practise just the word you got wrong | Feedback is whole-sentence only | Pronunciation problems never get fixed |
| R5 | Missed phrase | Comes back **tomorrow at the earliest** | No repeat inside the same game | Forgotten before it's practised again |
| R6 | Same phrase, every time | Shown the same way on every visit | No mastery steps per phrase | No push from "can read it" to "can say it from memory" |
| R7 | Listen cards | Only "repeat what you heard" | No comprehension check | You can echo sounds without understanding them |
| R8 | Card choice | Easy/Medium/Hard is pure choice | No nudge toward your growth zone | Players stay on Easy (safe) or fail on Hard |
| R9 | Real-life mission | Honour button; no follow-up | No reflection after real use | Real failures (biggest learning moment) are lost |
| R10 | Boss hint | One hint gives the whole answer | All-or-nothing help | Either stuck, or the answer is handed over |
| R11 | Progress | Stats rise on any right answer; no phrase list | No record of what you actually know | You can't see real improvement, so motivation fades |
| R12 | Habit | No daily goal | Play only when you remember | Language needs little-and-often practice |

---

## 4. Keep / Improve / Remove / Automate

| Part | Decision | Why |
|---|---|---|
| First Day level check | **KEEP** | Places players well; replay it weekly as the progress test |
| No-dice race, speak to move | **KEEP** | Core fun, skill-based |
| Speech check + typing fallback | **KEEP** | Works |
| Natural voices | **KEEP** | Real listening practice |
| Review deck (1/3/7 days) | **IMPROVE** | Add same-game repeats (R5) |
| Card types and mix | **IMPROVE** | Mastery steps per phrase (R2, R6) + Listen & answer (R7) |
| Fix it cards | **IMPROVE** | Add a one-line "why" in English + Bangla (R3) |
| Red-word feedback | **IMPROVE** | Tap a red word to hear and repeat just that word (R4) |
| Boss battle | **IMPROVE** | Only uses phrases you learned; hint ladder (R1, R10) |
| Easy/Medium/Hard | **IMPROVE** | Mark one card "⭐ Your level" with bonus XP (R8) |
| Real-life mission | **IMPROVE** | "How did it go?" → feeds review (R9) |
| Stats growth | **AUTOMATE** | Calculated from phrase mastery, not just right answers (R11) |
| Spaced review scheduling | **AUTOMATE** | Already rules-based; extend to mastery steps |
| Placeholder "coming soon" worlds on map | **KEEP** | Shows the journey |
| AI agent | **REMOVE / not used** | Rules are enough for this scope |

---

## 5. TO-BE: the improved learning loop

Every world follows **Learn → Practise → Use → Real life → Review**:

```
 ① LEARN         ② PRACTISE (race)        ③ USE (boss)          ④ REAL LIFE            ⑤ REVIEW
 Phrase Pack  →  same phrases, getting  →  boss uses ONLY     →  mission + "How did  →  spaced repeats,
 8 key phrases   harder each time you      phrases you've        it go?"                plus same-game
 hear·see·say    see them (mastery)        practised                                     repeats
```

### Mastery steps per phrase (fixes R2, R6)
Each phrase climbs **4 steps**; the card changes as you climb:

| Step | Card shows | What it trains |
|---|---|---|
| 0 New | Full English + audio (**Say it**) | Sound and shape |
| 1 Seen | English with 1–2 words blanked (**Fill the gap**) | Starting to remember |
| 2 Known | Bangla only (**From Bangla**) | Saying it from memory |
| 3 Mastered | Situation only, e.g. "Order coffee to go" (**Real talk**) | Using it like in real life |

Right on the first try → up one step. Wrong → down one step and **back in this same race 3 turns later** (R5), plus into the review deck.

### Other changes
- **Fix it "why" line (R3):** e.g. *"Questions with 'can' put 'can' before 'I': Where **can I**…"* · *"'can' দিয়ে প্রশ্নে 'can' আগে বসে।"*
- **Tap a red word (R4):** hear it slowly, say just that word, get a ✓.
- **Listen & answer (R7):** hear "We close at ten tonight" → question "What time do they close?" → you say "Ten" or "At ten".
- **⭐ Your level (R8):** one of the three cards is marked for your growth zone, with **+50% XP**.
- **Boss hint ladder (R10):** hint 1 = first word, hint 2 = key words, hint 3 = full sentence. Each hint costs a little score, but no hearts.
- **Boss uses only practised phrases (R1):** a world's boss rounds come from its Phrase Pack.
- **Mission reflection (R9):** after "I said it": *Worked 🙂 / They didn't understand me 😕 / I was too nervous 😬*. The last two put the phrase back in review and suggest the slow audio.
- **Phrasebook (R11):** every phrase with its mastery stars, so you can **see what you know**.
- **Daily goal (R12):** "10 good answers today" ring on the map, with a streak.
- **Weekly re-check:** First Day again after 7 days; the player card shows **before → after**.

---

## 6. Screen changes (inventory delta)

| Screen | New / change | Purpose | Primary action |
|---|---|---|---|
| **Phrase Pack** | NEW | Learn a world's 8 key phrases before racing | "Hear · Say" each phrase, then **Start race** |
| **Phrasebook** | NEW (map footer) | See every phrase and its mastery stars | Tap a phrase to practise it |
| Speaking card | CHANGE | Mastery-step layouts, Fix it "why", tappable red words, Listen & answer | Speak |
| Race card picker | CHANGE | "⭐ Your level" badge | Pick a card |
| Boss battle | CHANGE | Hint ladder, rounds from the Phrase Pack | Speak |
| Mission sheet | CHANGE | "How did it go?" after "I said it" | Pick one of 3 answers |
| Map | CHANGE | Daily goal ring + streak, Phrasebook button, weekly re-check banner | PLAY |
| Player card | CHANGE | "Last week → now" for each stat | Back to map |

**States to cover:** first visit (no mastery yet), all phrases mastered in a world, mic blocked (typing), offline audio fallback, streak broken, re-check not yet due.

---

## 7. Success measures (KPIs)

| Learning outcome | KPI | Baseline | Direction |
|---|---|---|---|
| Phrases stick | Phrases at "Mastered" | Measurement required | Up |
| Real recall | First-try right on **From Bangla / Real talk** cards | Measurement required | Up |
| Mistakes get fixed | % of missed phrases right on their next appearance | Measurement required | Up |
| Real-life use | Missions reported "Worked" per week | Measurement required | Up |
| Habit | Days per week the daily goal is met | Measurement required | Up |
| Overall level | Average stat change at the weekly re-check | Measurement required | Up |

All of these can be counted on the phone from data the game already has, plus the new mastery records. No numbers are promised until a baseline exists.

---

## 8. Suggested build order

1. **Mastery steps + same-game repeats + Fix it "why"** (the biggest learning gain)
2. **Phrase Pack + boss uses practised phrases + hint ladder**
3. **Tap red words + Listen & answer**
4. **Phrasebook + daily goal + mission reflection + weekly re-check**
