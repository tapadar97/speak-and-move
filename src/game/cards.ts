export type Place = 'deli' | 'subway' | 'pharmacy' | 'laundromat' | 'doctor' | 'street';
export type Level = 1 | 2 | 3;
/**
 * say    – read the English out loud
 * listen – hear it (text hidden), say it back
 * fix    – a sentence with a mistake; say it correctly
 * recall – see the situation and Bangla meaning only; say it in English
 */
export type CardType = 'say' | 'listen' | 'fix' | 'recall';

export interface Card {
  id: string;
  place: Place;
  level: Level;
  type: CardType;
  /** What the player must say. */
  target: string;
  /** Other answers that also count. */
  accept?: string[];
  /** Bangla meaning, shown as a hint. */
  bn: string;
  /** fix: the wrong sentence. recall: the situation. */
  prompt?: string;
}

export const PLACES: Record<Place, { name: string; icon: string }> = {
  deli: { name: 'Deli', icon: '🥯' },
  subway: { name: 'Subway', icon: '🚇' },
  pharmacy: { name: 'Pharmacy', icon: '💊' },
  laundromat: { name: 'Laundromat', icon: '🧺' },
  doctor: { name: 'Doctor', icon: '🩺' },
  street: { name: 'Street', icon: '🚕' },
};

export const STEPS: Record<Level, number> = { 1: 1, 2: 2, 3: 3 };
export const LEVEL_NAME: Record<Level, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
export const TYPE_NAME: Record<CardType, string> = {
  say: 'Say it',
  listen: 'Listen',
  fix: 'Fix it',
  recall: 'From Bangla',
};

export const CARDS: Card[] = [
  // Deli
  { id: 'deli-1', place: 'deli', level: 1, type: 'say', target: 'Can I get a coffee, please?', accept: ['Can I have a coffee please'], bn: 'আমাকে একটা কফি দিতে পারবেন?' },
  { id: 'deli-2', place: 'deli', level: 1, type: 'say', target: 'How much is this?', bn: 'এটার দাম কত?' },
  { id: 'deli-3', place: 'deli', level: 1, type: 'say', target: "I'm all set, thanks.", accept: ["I'm all set thank you"], bn: 'আর কিছু লাগবে না, ধন্যবাদ।' },
  { id: 'deli-4', place: 'deli', level: 2, type: 'listen', target: 'Anything else for you?', bn: 'আপনার আর কিছু লাগবে?' },
  { id: 'deli-5', place: 'deli', level: 2, type: 'fix', prompt: 'Can I gets a bagel with cream cheese?', target: 'Can I get a bagel with cream cheese?', accept: ['Can I have a bagel with cream cheese'], bn: 'ক্রিম চিজ দিয়ে একটা বেগেল দেবেন?' },
  { id: 'deli-6', place: 'deli', level: 2, type: 'say', target: 'Can I get that to go?', accept: ['Can I have that to go', 'Can I get it to go'], bn: 'এটা প্যাক করে দেবেন? নিয়ে যাব।' },
  { id: 'deli-7', place: 'deli', level: 3, type: 'recall', prompt: 'Order a bacon, egg and cheese sandwich on a roll.', target: 'Can I get a bacon, egg and cheese on a roll?', accept: ['Can I have a bacon egg and cheese on a roll', 'Bacon egg and cheese on a roll please'], bn: 'রোল রুটিতে বেকন, ডিম আর চিজ দিয়ে একটা স্যান্ডউইচ দেবেন?' },
  { id: 'deli-8', place: 'deli', level: 3, type: 'listen', target: 'You want salt, pepper, ketchup on that?', accept: ['Do you want salt pepper ketchup on that'], bn: 'এতে লবণ, গোলমরিচ, কেচাপ দেব?' },

  // Subway
  { id: 'subway-1', place: 'subway', level: 1, type: 'say', target: 'Does this train go to Queens?', bn: 'এই ট্রেন কি কুইন্স যায়?' },
  { id: 'subway-2', place: 'subway', level: 1, type: 'say', target: 'Excuse me, this is my stop.', bn: 'মাফ করবেন, আমি এখানে নামব।' },
  { id: 'subway-3', place: 'subway', level: 2, type: 'listen', target: 'Stand clear of the closing doors, please.', bn: 'দরজা বন্ধ হচ্ছে, সরে দাঁড়ান।' },
  { id: 'subway-4', place: 'subway', level: 2, type: 'fix', prompt: 'Where I can buy a MetroCard?', target: 'Where can I buy a MetroCard?', bn: 'মেট্রোকার্ড কোথায় কিনতে পারি?' },
  { id: 'subway-5', place: 'subway', level: 2, type: 'say', target: 'Is this the uptown train?', bn: 'এটা কি আপটাউনের ট্রেন?' },
  { id: 'subway-6', place: 'subway', level: 3, type: 'listen', target: 'The next stop is Jay Street, MetroTech.', bn: 'পরের স্টপ জে স্ট্রিট, মেট্রোটেক।' },
  { id: 'subway-7', place: 'subway', level: 3, type: 'recall', prompt: 'Ask someone how to get to Times Square.', target: 'How do I get to Times Square?', accept: ['How can I get to Times Square', 'Which train goes to Times Square'], bn: 'টাইমস স্কয়ারে কীভাবে যাব?' },

  // Pharmacy
  { id: 'pharmacy-1', place: 'pharmacy', level: 1, type: 'say', target: 'Do you have Tylenol?', bn: 'আপনাদের কাছে টাইলেনল আছে?' },
  { id: 'pharmacy-2', place: 'pharmacy', level: 1, type: 'say', target: 'I need something for a headache.', bn: 'মাথা ব্যথার জন্য কিছু দরকার।' },
  { id: 'pharmacy-3', place: 'pharmacy', level: 2, type: 'say', target: "I'm here to pick up a prescription.", bn: 'আমি প্রেসক্রিপশনের ওষুধ নিতে এসেছি।' },
  { id: 'pharmacy-4', place: 'pharmacy', level: 2, type: 'fix', prompt: 'How many times I take this?', target: 'How many times do I take this?', accept: ['How many times a day do I take this', 'How often do I take this'], bn: 'এটা কতবার খাব?' },
  { id: 'pharmacy-5', place: 'pharmacy', level: 2, type: 'listen', target: "What's your date of birth?", bn: 'আপনার জন্ম তারিখ কী?' },
  { id: 'pharmacy-6', place: 'pharmacy', level: 3, type: 'recall', prompt: 'Ask if the medicine makes you sleepy.', target: 'Does this medicine make you sleepy?', accept: ['Will this make me sleepy', 'Does this make you sleepy', 'Does it make you sleepy'], bn: 'এই ওষুধ খেলে কি ঘুম পায়?' },
  { id: 'pharmacy-7', place: 'pharmacy', level: 3, type: 'listen', target: "It'll be ready in about twenty minutes.", bn: 'প্রায় বিশ মিনিটের মধ্যে তৈরি হয়ে যাবে।' },

  // Laundromat
  { id: 'laundromat-1', place: 'laundromat', level: 1, type: 'say', target: 'Is this machine free?', bn: 'এই মেশিনটা কি খালি?' },
  { id: 'laundromat-2', place: 'laundromat', level: 1, type: 'say', target: 'Where do I put the soap?', bn: 'সাবান কোথায় দেব?' },
  { id: 'laundromat-3', place: 'laundromat', level: 2, type: 'fix', prompt: "This machine don't work.", target: "This machine doesn't work.", accept: ["This machine isn't working"], bn: 'এই মেশিনটা কাজ করছে না।' },
  { id: 'laundromat-4', place: 'laundromat', level: 2, type: 'say', target: 'Do you have change for a five?', bn: 'পাঁচ ডলারের খুচরা হবে?' },
  { id: 'laundromat-5', place: 'laundromat', level: 2, type: 'listen', target: 'We close at ten tonight.', bn: 'আজ রাত দশটায় আমরা বন্ধ করি।' },
  { id: 'laundromat-6', place: 'laundromat', level: 3, type: 'recall', prompt: 'Ask how long the dryer takes.', target: 'How long does the dryer take?', accept: ['How much time does the dryer take', 'How long is the dryer'], bn: 'ড্রায়ারে কতক্ষণ লাগে?' },
  { id: 'laundromat-7', place: 'laundromat', level: 3, type: 'listen', target: 'You can leave it here and pick it up tomorrow.', bn: 'এখানে রেখে যান, কাল এসে নিয়ে যাবেন।' },

  // Doctor
  { id: 'doctor-1', place: 'doctor', level: 1, type: 'say', target: 'I have an appointment at three.', bn: 'তিনটায় আমার অ্যাপয়েন্টমেন্ট আছে।' },
  { id: 'doctor-2', place: 'doctor', level: 1, type: 'say', target: 'My throat hurts.', bn: 'আমার গলা ব্যথা করছে।' },
  { id: 'doctor-3', place: 'doctor', level: 2, type: 'fix', prompt: 'I am sick since Monday.', target: "I've been sick since Monday.", bn: 'সোমবার থেকে আমি অসুস্থ।' },
  { id: 'doctor-4', place: 'doctor', level: 2, type: 'listen', target: 'Can I see your insurance card?', bn: 'আপনার ইনস্যুরেন্স কার্ডটা দেখতে পারি?' },
  { id: 'doctor-5', place: 'doctor', level: 2, type: 'say', target: 'Can you speak more slowly, please?', accept: ['Can you speak slowly please', 'Could you speak more slowly please'], bn: 'একটু আস্তে বলবেন, প্লিজ?' },
  { id: 'doctor-6', place: 'doctor', level: 3, type: 'recall', prompt: 'Tell the doctor you have had a fever for two days.', target: "I've had a fever for two days.", bn: 'দুই দিন ধরে আমার জ্বর।' },
  { id: 'doctor-7', place: 'doctor', level: 3, type: 'listen', target: 'Take one pill twice a day after meals.', bn: 'দিনে দুইবার, খাওয়ার পরে একটা করে বড়ি খাবেন।' },

  // Street
  { id: 'street-1', place: 'street', level: 1, type: 'say', target: 'Excuse me, where is the bus stop?', bn: 'মাফ করবেন, বাস স্টপ কোথায়?' },
  { id: 'street-2', place: 'street', level: 1, type: 'say', target: 'Sorry, can you say that again?', accept: ['Sorry could you say that again', 'Can you say that again please'], bn: 'দুঃখিত, আবার বলবেন?' },
  { id: 'street-3', place: 'street', level: 2, type: 'listen', target: 'Go two blocks and make a left.', bn: 'দুই ব্লক গিয়ে বাঁ দিকে যান।' },
  { id: 'street-4', place: 'street', level: 2, type: 'fix', prompt: 'How long you live here?', target: 'How long have you lived here?', accept: ['How long have you been living here'], bn: 'আপনি এখানে কতদিন ধরে থাকেন?' },
  { id: 'street-5', place: 'street', level: 2, type: 'say', target: 'Nice weather today, right?', bn: 'আজকের আবহাওয়াটা সুন্দর, তাই না?' },
  { id: 'street-6', place: 'street', level: 3, type: 'recall', prompt: 'Tell someone you are new in the neighborhood.', target: 'I just moved to the neighborhood.', accept: ["I'm new in the neighborhood", 'I just moved here'], bn: 'আমি এই এলাকায় নতুন এসেছি।' },
  { id: 'street-7', place: 'street', level: 3, type: 'listen', target: "It's right across the street from the bank.", bn: 'ব্যাংকের ঠিক উল্টো দিকে।' },
];

export const cardById = (id: string) => CARDS.find((c) => c.id === id);
