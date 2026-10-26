import type { Place, WorldId } from './cards';

export interface WorldInfo {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  icon: string;
  /** Background art for the board's center. */
  art: string;
  playable: boolean;
  /** Places on squares 2–19, in order. */
  layout?: Place[];
  /** Land exactly on a key square and ride forward to the value square. */
  express?: Record<number, number>;
  reward?: { coins: number; xp: number; outfit: string };
  /** The rival's chance of getting each card level right. */
  rivalSkill?: Record<1 | 2 | 3, number>;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Bodega Block',
    icon: '🥯',
    art: 'board-city-1',
    playable: true,
    layout: [
      'deli', 'pharmacy', 'subway', 'laundromat', 'street', 'doctor',
      'deli', 'pharmacy', 'laundromat', 'street', 'doctor', 'subway',
      'deli', 'laundromat', 'pharmacy', 'street', 'doctor', 'deli',
    ],
    express: { 4: 8, 13: 16 },
    reward: { coins: 150, xp: 200, outfit: 'Bodega apron' },
    rivalSkill: { 1: 0.9, 2: 0.7, 3: 0.48 },
  },
  {
    id: 2,
    name: 'The Subway',
    icon: '🚇',
    art: 'board-city-2',
    playable: true,
    layout: [
      'turnstile', 'platform', 'train', 'transfer', 'exit', 'bus',
      'turnstile', 'platform', 'transfer', 'exit', 'bus', 'train',
      'platform', 'turnstile', 'transfer', 'exit', 'bus', 'platform',
    ],
    express: { 4: 8, 13: 16 },
    reward: { coins: 150, xp: 200, outfit: 'Pinstripe cap' },
    rivalSkill: { 1: 0.93, 2: 0.76, 3: 0.56 },
  },
  { id: 3, name: 'The Neighborhood', icon: '🏘️', art: 'world-3', playable: false },
  { id: 4, name: 'The Office', icon: '💼', art: 'world-4', playable: false },
  { id: 5, name: 'Manhattan', icon: '🗽', art: 'world-5', playable: false },
];

export const worldById = (id: number) => WORLDS.find((w) => w.id === id)!;
export const isPlayable = (id: number): id is WorldId => worldById(id)?.playable ?? false;
