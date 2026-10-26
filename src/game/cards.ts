export type Place =
  | 'deli' | 'subway' | 'pharmacy' | 'laundromat' | 'doctor' | 'street'
  | 'turnstile' | 'platform' | 'train' | 'transfer' | 'exit' | 'bus';
export type WorldId = 1 | 2;
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
  world: WorldId;
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
  turnstile: { name: 'Turnstile', icon: '🎫' },
  platform: { name: 'Platform', icon: '🚉' },
  train: { name: 'Train', icon: '🚇' },
  transfer: { name: 'Transfer', icon: '🔀' },
  exit: { name: 'Exit', icon: '🪜' },
  bus: { name: 'Bus', icon: '🚌' },
};

export const STEPS: Record<Level, number> = { 1: 1, 2: 2, 3: 3 };
export const LEVEL_NAME: Record<Level, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
export const TYPE_NAME: Record<CardType, string> = {
  say: 'Say it',
  listen: 'Listen',
  fix: 'Fix it',
  recall: 'From Bangla',
};

const WORLD_1: Omit<Card, 'world'>[] = [
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

  // Boss phrases (learned in the Phrase Pack, used against Tony)
  { id: 'deli-b1', place: 'deli', level: 2, type: 'say', target: 'Bacon, egg and cheese on a roll, please.', accept: ['Can I get a bacon egg and cheese on a roll', 'A bacon egg and cheese on a roll please'], bn: 'রোলে বেকন, ডিম আর চিজ দেবেন।' },
  { id: 'deli-b2', place: 'deli', level: 1, type: 'say', target: 'Yes, everything please.', accept: ['Yeah everything', 'Everything please', 'Yes all of it please'], bn: 'হ্যাঁ, সবকিছু দিন।' },
  { id: 'deli-b3', place: 'deli', level: 2, type: 'say', target: 'Yes, a small coffee with milk and sugar.', accept: ['Yeah a small coffee with milk and sugar please'], bn: 'হ্যাঁ, দুধ আর চিনি দিয়ে একটা ছোট কফি।' },
  { id: 'deli-b4', place: 'deli', level: 1, type: 'say', target: 'To go, please.', accept: ["It's to go"], bn: 'নিয়ে যাব।' },
  { id: 'deli-b5', place: 'deli', level: 1, type: 'say', target: 'Can I pay by card?', accept: ['Can I pay with card', 'Can I use my card', 'Do you take cards'], bn: 'কার্ডে দিতে পারি?' },
  { id: 'deli-b6', place: 'deli', level: 1, type: 'say', target: "No, I'm all set. Thanks!", accept: ["No that's all thanks", "I'm all set thank you", 'No thank you that is it'], bn: 'না, আর কিছু লাগবে না। ধন্যবাদ!' },
];

const WORLD_2: Omit<Card, 'world'>[] = [
  // Turnstile
  { id: 'turnstile-1', place: 'turnstile', level: 1, type: 'say', target: 'How much is one ride?', bn: 'এক রাইডের ভাড়া কত?' },
  { id: 'turnstile-2', place: 'turnstile', level: 1, type: 'say', target: "My card isn't working.", accept: ['My card is not working', "My card doesn't work"], bn: 'আমার কার্ড কাজ করছে না।' },
  { id: 'turnstile-3', place: 'turnstile', level: 2, type: 'fix', prompt: 'Where I can add money on my card?', target: 'Where can I add money to my card?', accept: ['Where can I put money on my card'], bn: 'কার্ডে টাকা কোথায় ভরতে পারি?' },
  { id: 'turnstile-4', place: 'turnstile', level: 2, type: 'listen', target: 'Please swipe again at this turnstile.', bn: 'এই টার্নস্টাইলে আবার সোয়াইপ করুন।' },
  { id: 'turnstile-5', place: 'turnstile', level: 2, type: 'say', target: 'Can I pay with my phone here?', bn: 'এখানে কি ফোন দিয়ে পে করতে পারি?' },
  { id: 'turnstile-6', place: 'turnstile', level: 3, type: 'recall', prompt: 'Tell the station agent the machine took your money.', target: "The machine took my money but didn't give me a card.", accept: ["The machine took my money and didn't give me a card"], bn: 'মেশিন আমার টাকা নিয়েছে কিন্তু কার্ড দেয়নি।' },
  { id: 'turnstile-7', place: 'turnstile', level: 3, type: 'listen', target: 'Go to the booth, they can give you a refund.', bn: 'বুথে যান, ওরা টাকা ফেরত দিতে পারবে।' },

  // Platform
  { id: 'platform-1', place: 'platform', level: 1, type: 'say', target: 'Which side is uptown?', bn: 'আপটাউন কোন দিকে?' },
  { id: 'platform-2', place: 'platform', level: 1, type: 'say', target: 'Is the train coming soon?', bn: 'ট্রেন কি শিগগির আসছে?' },
  { id: 'platform-3', place: 'platform', level: 2, type: 'listen', target: 'The next uptown train is two stops away.', bn: 'পরের আপটাউন ট্রেন দুই স্টপ দূরে।' },
  { id: 'platform-4', place: 'platform', level: 2, type: 'fix', prompt: 'This train go to Brooklyn?', target: 'Does this train go to Brooklyn?', bn: 'এই ট্রেন কি ব্রুকলিন যায়?' },
  { id: 'platform-5', place: 'platform', level: 2, type: 'say', target: 'Excuse me, is this the right platform?', bn: 'মাফ করবেন, এটা কি ঠিক প্ল্যাটফর্ম?' },
  { id: 'platform-6', place: 'platform', level: 3, type: 'listen', target: 'Due to signal problems, trains are running with delays.', bn: 'সিগন্যাল সমস্যার কারণে ট্রেন দেরিতে চলছে।' },
  { id: 'platform-7', place: 'platform', level: 3, type: 'recall', prompt: 'Ask how long the delay will be.', target: 'How long will the delay be?', accept: ['How long is the delay', 'How long will we have to wait'], bn: 'দেরি কতক্ষণ হবে?' },

  // Train
  { id: 'train-1', place: 'train', level: 1, type: 'say', target: 'Is this seat free?', accept: ['Is this seat taken'], bn: 'এই সিটটা কি খালি?' },
  { id: 'train-2', place: 'train', level: 1, type: 'say', target: 'Sorry, can I get by?', accept: ['Excuse me can I get by'], bn: 'মাফ করবেন, একটু যেতে দেবেন?' },
  { id: 'train-3', place: 'train', level: 2, type: 'listen', target: 'This is an express train. Next stop, Union Square.', bn: 'এটা এক্সপ্রেস ট্রেন। পরের স্টপ ইউনিয়ন স্কয়ার।' },
  { id: 'train-4', place: 'train', level: 2, type: 'fix', prompt: 'I need get off at the next stop.', target: 'I need to get off at the next stop.', bn: 'আমাকে পরের স্টপে নামতে হবে।' },
  { id: 'train-5', place: 'train', level: 2, type: 'say', target: 'Does this train stop at Union Square?', bn: 'এই ট্রেন কি ইউনিয়ন স্কয়ারে থামে?' },
  { id: 'train-6', place: 'train', level: 3, type: 'recall', prompt: 'Ask a passenger how many stops are left to Union Square.', target: 'How many stops is it to Union Square?', accept: ['How many more stops to Union Square', 'How many stops until Union Square'], bn: 'ইউনিয়ন স্কয়ার আর কয় স্টপ?' },
  { id: 'train-7', place: 'train', level: 3, type: 'listen', target: 'We are being held momentarily by the train dispatcher.', bn: 'ট্রেন কন্ট্রোলের নির্দেশে আমরা কিছুক্ষণ থেমে আছি।' },

  // Transfer
  { id: 'transfer-1', place: 'transfer', level: 1, type: 'say', target: 'Where is the exit?', bn: 'বের হওয়ার পথ কোথায়?' },
  { id: 'transfer-2', place: 'transfer', level: 1, type: 'say', target: 'Where do I change trains?', bn: 'ট্রেন কোথায় বদলাব?' },
  { id: 'transfer-3', place: 'transfer', level: 2, type: 'listen', target: 'Transfer here for the four, five and six trains.', bn: '৪, ৫ আর ৬ নম্বর ট্রেনের জন্য এখানে বদল করুন।' },
  { id: 'transfer-4', place: 'transfer', level: 2, type: 'fix', prompt: 'Which way I go for the L train?', target: 'Which way do I go for the L train?', bn: 'এল ট্রেনের জন্য কোন দিকে যাব?' },
  { id: 'transfer-5', place: 'transfer', level: 2, type: 'say', target: 'Can I transfer for free here?', bn: 'এখানে কি ফ্রিতে ট্রেন বদলানো যায়?' },
  { id: 'transfer-6', place: 'transfer', level: 3, type: 'recall', prompt: 'Ask if you need to leave the station to transfer.', target: 'Do I have to leave the station to transfer?', accept: ['Do I need to leave the station to transfer'], bn: 'ট্রেন বদলাতে কি স্টেশন থেকে বের হতে হবে?' },
  { id: 'transfer-7', place: 'transfer', level: 3, type: 'listen', target: 'Follow the signs and take the stairs to the downtown platform.', bn: 'সাইন দেখে সিঁড়ি দিয়ে ডাউনটাউন প্ল্যাটফর্মে যান।' },

  // Street exit
  { id: 'exit-1', place: 'exit', level: 1, type: 'say', target: 'Which exit for the park?', bn: 'পার্কের জন্য কোন এক্সিট?' },
  { id: 'exit-2', place: 'exit', level: 1, type: 'say', target: 'Is the museum near here?', bn: 'জাদুঘরটা কি কাছে?' },
  { id: 'exit-3', place: 'exit', level: 2, type: 'listen', target: 'Take the exit on the right and walk two blocks.', bn: 'ডান দিকের এক্সিট নিয়ে দুই ব্লক হাঁটুন।' },
  { id: 'exit-4', place: 'exit', level: 2, type: 'fix', prompt: 'How I get to the library?', target: 'How do I get to the library?', bn: 'লাইব্রেরিতে কীভাবে যাব?' },
  { id: 'exit-5', place: 'exit', level: 2, type: 'say', target: 'Is it walking distance from here?', bn: 'এখান থেকে কি হেঁটে যাওয়া যায়?' },
  { id: 'exit-6', place: 'exit', level: 3, type: 'recall', prompt: "Tell someone you're lost and ask for help.", target: "Sorry, I'm lost. Can you help me find this address?", accept: ["Excuse me I'm lost can you help me find this address"], bn: 'দুঃখিত, আমি পথ হারিয়েছি। এই ঠিকানাটা খুঁজে দিতে সাহায্য করবেন?' },
  { id: 'exit-7', place: 'exit', level: 3, type: 'listen', target: "It's about ten minutes on foot, or you can grab a bus.", bn: 'হেঁটে প্রায় দশ মিনিট, নয়তো বাস ধরতে পারেন।' },

  // Bus
  { id: 'bus-1', place: 'bus', level: 1, type: 'say', target: 'Does this bus go downtown?', bn: 'এই বাস কি ডাউনটাউন যায়?' },
  { id: 'bus-2', place: 'bus', level: 1, type: 'say', target: 'Can I pay with cash?', bn: 'নগদ টাকায় ভাড়া দিতে পারি?' },
  { id: 'bus-3', place: 'bus', level: 2, type: 'listen', target: 'Exact change only, no dollar bills.', bn: 'শুধু খুচরা পয়সা, ডলারের নোট চলবে না।' },
  { id: 'bus-4', place: 'bus', level: 2, type: 'fix', prompt: 'Please tell me when we arrive to Main Street.', target: 'Please tell me when we get to Main Street.', accept: ['Please tell me when we arrive at Main Street'], bn: 'মেইন স্ট্রিটে পৌঁছালে আমাকে বলবেন, প্লিজ।' },
  { id: 'bus-5', place: 'bus', level: 2, type: 'say', target: 'How often does this bus come?', bn: 'এই বাস কতক্ষণ পরপর আসে?' },
  { id: 'bus-6', place: 'bus', level: 3, type: 'recall', prompt: 'Ask the driver to let you off at the next stop.', target: 'Could you let me off at the next stop?', accept: ['Can you let me off at the next stop'], bn: 'পরের স্টপে আমাকে নামিয়ে দেবেন?' },
  { id: 'bus-7', place: 'bus', level: 3, type: 'listen', target: 'This bus is out of service. Please wait for the next one.', bn: 'এই বাস চলছে না। পরেরটার জন্য অপেক্ষা করুন।' },

  // Boss phrases (learned in the Phrase Pack, used against the Conductor)
  { id: 'turnstile-b1', place: 'turnstile', level: 2, type: 'say', target: 'Sorry, where can I refill my card?', accept: ['Sorry where can I add money to my card', 'Where can I refill my card'], bn: 'দুঃখিত, কার্ড কোথায় রিফিল করতে পারি?' },
  { id: 'exit-b2', place: 'exit', level: 2, type: 'say', target: "I'm going to Jackson Heights in Queens.", accept: ["I'm heading to Jackson Heights in Queens", 'I am going to Jackson Heights in Queens'], bn: 'আমি কুইন্সের জ্যাকসন হাইটসে যাচ্ছি।' },
  { id: 'platform-b3', place: 'platform', level: 2, type: 'say', target: 'How do I get to the uptown platform?', accept: ['How can I get to the uptown platform', 'Where is the uptown platform'], bn: 'আপটাউন প্ল্যাটফর্মে কীভাবে যাব?' },
  { id: 'train-b4', place: 'train', level: 1, type: 'say', target: 'I need the express train.', accept: ['I need the express', 'The express please'], bn: 'আমার এক্সপ্রেস ট্রেন লাগবে।' },
  { id: 'train-b5', place: 'train', level: 3, type: 'say', target: 'So should I take the local train?', accept: ['Should I take the local train then', "Then I'll take the local train"], bn: 'তাহলে কি লোকাল ট্রেন নেব?' },
  { id: 'exit-b6', place: 'exit', level: 1, type: 'say', target: 'Thank you so much, have a good day!', accept: ['Thanks a lot have a good day', 'Thank you have a good one', 'Thanks have a nice day'], bn: 'অনেক ধন্যবাদ, আপনার দিন ভালো কাটুক!' },
];

export const CARDS: Card[] = [
  ...WORLD_1.map((c) => ({ ...c, world: 1 as const })),
  ...WORLD_2.map((c) => ({ ...c, world: 2 as const })),
];

export const cardById = (id: string) => CARDS.find((c) => c.id === id);
