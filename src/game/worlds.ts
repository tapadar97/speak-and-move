import type { Place, WorldId } from './cards';

export interface WorldInfo {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  icon: string;
  /** The level's goal, shown under its badge. */
  goal?: string;
  about?: string;
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
  /** Paid the first time you win the world's Native round. */
  nativeReward?: { coins: number; xp: number; outfit: string };
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Bodega Block',
    icon: '🥯',
    goal: 'Order like a New Yorker',
    about: 'The phrases you need at the deli, pharmacy, laundromat, doctor and on the street.',
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
    nativeReward: { coins: 100, xp: 150, outfit: 'Deli Legend cap' },
  },
  {
    id: 2,
    name: 'The Subway',
    icon: '🚇',
    goal: 'Ride the subway with confidence',
    about: 'Tickets, platforms, trains, transfers, exits and buses.',
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
    nativeReward: { coins: 100, xp: 150, outfit: 'Rush Hour sneakers' },
  },
  {
    id: 3,
    name: 'The Neighborhood',
    icon: '🏘️',
    goal: 'Handle home life in English',
    about: 'Your landlord, the super, neighbors, packages, the park, and calling 311.',
    art: 'world-3',
    playable: true,
    layout: [
      'landlord', 'neighbor', 'super', 'mailroom', 'park', 'call311',
      'neighbor', 'landlord', 'park', 'super', 'call311', 'mailroom',
      'super', 'neighbor', 'landlord', 'park', 'mailroom', 'call311',
    ],
    reward: { coins: 200, xp: 250, outfit: 'Brownstone keys' },
    rivalSkill: { 1: 0.94, 2: 0.8, 3: 0.62 },
    nativeReward: { coins: 120, xp: 180, outfit: 'Block Party shades' },
  },
  {
    id: 4,
    name: 'The Office',
    icon: '💼',
    goal: 'Get the job and speak up at work',
    about: 'Job interviews, meetings, phone calls, coworkers, your manager and HR.',
    art: 'world-4',
    playable: true,
    layout: [
      'interview', 'coworker', 'meeting', 'phonecall', 'manager', 'hrdesk',
      'coworker', 'meeting', 'interview', 'phonecall', 'hrdesk', 'manager',
      'meeting', 'coworker', 'phonecall', 'interview', 'manager', 'hrdesk',
    ],
    reward: { coins: 250, xp: 300, outfit: 'Power blazer' },
    rivalSkill: { 1: 0.95, 2: 0.83, 3: 0.67 },
    nativeReward: { coins: 140, xp: 210, outfit: 'Corner office badge' },
  },
  {
    id: 5,
    name: 'Manhattan',
    icon: '🗽',
    goal: 'Live it up like a real New Yorker',
    about: 'Restaurants, bars, taxis, shops, parties and Broadway. Fast, loud and real.',
    art: 'world-5',
    playable: true,
    layout: [
      'restaurant', 'taxi', 'bar', 'shop', 'party', 'theater',
      'taxi', 'restaurant', 'shop', 'bar', 'theater', 'party',
      'restaurant', 'taxi', 'party', 'shop', 'bar', 'theater',
    ],
    express: { 8: 12, 15: 18 },
    reward: { coins: 300, xp: 400, outfit: 'Skyline jacket' },
    rivalSkill: { 1: 0.96, 2: 0.86, 3: 0.72 },
    nativeReward: { coins: 200, xp: 300, outfit: 'Expert New Yorker crown' },
  },
];

export const worldById = (id: number) => WORLDS.find((w) => w.id === id)!;
export const isPlayable = (id: number): id is WorldId => worldById(id)?.playable ?? false;
