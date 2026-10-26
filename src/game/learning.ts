/**
 * Teaching content layered on the phrase cards: what situation each phrase is
 * for, why a Fix-it sentence is wrong, and how to reply to what you hear.
 */

/** "Real talk" step: the situation only. Recall cards use their own prompt. */
export const SITUATIONS: Record<string, string> = {
  'deli-1': 'Order a coffee.',
  'deli-2': 'Ask the price of something.',
  'deli-3': "Tell the deli worker you don't need anything else.",
  'deli-4': 'The worker checks if you want more. Ask it the way they do.',
  'deli-5': 'Order a bagel with cream cheese.',
  'deli-6': 'Ask for your food to take away.',
  'deli-8': 'Ask a customer if they want salt, pepper and ketchup.',
  'subway-1': 'Ask if this train goes to Queens.',
  'subway-2': 'Tell people you need to get off here.',
  'subway-3': 'Warn people that the doors are closing.',
  'subway-4': 'Ask where you can buy a MetroCard.',
  'subway-5': 'Check if this train goes uptown.',
  'subway-6': 'Announce that the next stop is Jay Street, MetroTech.',
  'pharmacy-1': 'Ask if the pharmacy sells Tylenol.',
  'pharmacy-2': 'Say you need medicine for a headache.',
  'pharmacy-3': 'Say you came to collect your prescription.',
  'pharmacy-4': 'Ask how many times you should take the medicine.',
  'pharmacy-5': "Ask a customer when they were born, like the pharmacist does.",
  'pharmacy-7': 'Tell a customer their order needs about twenty minutes.',
  'laundromat-1': 'Ask if a machine is available.',
  'laundromat-2': 'Ask where the soap goes.',
  'laundromat-3': 'Report that a machine is broken.',
  'laundromat-4': 'Ask someone to break a five-dollar bill.',
  'laundromat-5': 'Tell customers the laundromat closes at ten tonight.',
  'laundromat-7': 'Tell a customer they can collect their laundry tomorrow.',
  'doctor-1': 'Tell the front desk your appointment is at three.',
  'doctor-2': 'Tell the doctor your throat is sore.',
  'doctor-3': 'Say you have been ill since Monday.',
  'doctor-4': 'Ask a patient for their insurance card.',
  'doctor-5': 'Ask someone to talk slower.',
  'doctor-7': 'Explain: one pill, two times a day, after eating.',
  'street-1': 'Ask a stranger where the bus stop is.',
  'street-2': "You didn't catch what someone said. Ask them to repeat it.",
  'street-3': 'Give directions: two blocks, then turn left.',
  'street-4': 'Ask your neighbor how long they have lived here.',
  'street-5': 'Make small talk about the nice weather.',
  'street-7': "Say the place is opposite the bank.",
  'turnstile-1': 'Ask the price of one subway ride.',
  'turnstile-2': 'Tell the station agent your card has a problem.',
  'turnstile-3': 'Ask where to put more money on your card.',
  'turnstile-4': 'Tell someone to swipe their card one more time.',
  'turnstile-5': 'Ask if you can tap your phone to pay.',
  'turnstile-7': 'Tell someone the booth will return their money.',
  'platform-1': 'Ask which side of the platform is for uptown.',
  'platform-2': 'Ask if the train will arrive soon.',
  'platform-3': 'Say the next uptown train is two stops away.',
  'platform-4': 'Ask if this train goes to Brooklyn.',
  'platform-5': "Check you're on the correct platform.",
  'platform-6': 'Announce that signal problems are causing delays.',
  'train-1': 'Ask if the seat next to someone is taken.',
  'train-2': 'Politely ask people to let you pass.',
  'train-3': 'Announce: express train, next stop Union Square.',
  'train-4': 'Tell people you have to get off at the next stop.',
  'train-5': 'Ask if this train stops at Union Square.',
  'train-7': 'Announce that the train is waiting for the dispatcher.',
  'transfer-1': 'Ask where the way out is.',
  'transfer-2': 'Ask where to switch to another train.',
  'transfer-3': 'Announce the transfer to the 4, 5 and 6 trains.',
  'transfer-4': 'Ask which direction to walk for the L train.',
  'transfer-5': 'Ask if changing trains here is free.',
  'transfer-7': 'Tell someone to follow the signs and take the stairs downtown.',
  'exit-1': 'Ask which exit goes to the park.',
  'exit-2': 'Ask if the museum is close.',
  'exit-3': 'Give directions: right exit, then two blocks.',
  'exit-4': 'Ask how to get to the library.',
  'exit-5': 'Ask if you can walk there.',
  'exit-7': 'Say it takes ten minutes to walk, or you can take a bus.',
  'bus-1': 'Ask if this bus goes downtown.',
  'bus-2': 'Ask if you can pay with cash.',
  'bus-3': 'Tell riders: coins only, no paper dollars.',
  'bus-4': 'Ask the driver to tell you when you reach Main Street.',
  'bus-5': 'Ask how often this bus comes.',
  'bus-7': 'Tell people this bus is not running and to wait for the next.',
  // Boss phrases
  'deli-b1': 'Order a bacon, egg and cheese on a roll.',
  'deli-b2': 'Say yes to salt, pepper and ketchup: everything.',
  'deli-b3': 'Add a small coffee with milk and sugar.',
  'deli-b4': 'Say you want it to take away.',
  'deli-b5': 'Ask if you can pay with a card.',
  'deli-b6': "Say you don't need anything else, and thank them.",
  'turnstile-b1': 'Ask where to put money on your card.',
  'exit-b2': "Say you're going to Jackson Heights in Queens.",
  'platform-b3': 'Ask how to get to the uptown platform.',
  'train-b4': 'Say you need the express train.',
  'train-b5': 'Ask if you should take the local train instead.',
  'exit-b6': 'Thank the conductor and wish them a good day.',
};

export interface Why {
  en: string;
  bn: string;
}

/** Why each Fix-it sentence was wrong: the rule, short, in English and Bangla. */
export const WHY: Record<string, Why> = {
  'deli-5': { en: "After 'can', the verb has no -s: can I **get**, not can I gets.", bn: "'can'-এর পরে ক্রিয়ায় -s বসে না: can I get।" },
  'subway-4': { en: "In questions, 'can' comes before 'I': Where **can I** buy…?", bn: "প্রশ্নে 'can' আগে, 'I' পরে: Where can I…?" },
  'pharmacy-4': { en: "Questions with 'how many times' need **do**: How many times **do I** take this?", bn: "এমন প্রশ্নে 'do' লাগে: …do I take this?" },
  'laundromat-3': { en: "With he/she/it/this machine, use **doesn't**, not don't.", bn: "he/she/it বা 'this machine'-এর সাথে doesn't হয়, don't না।" },
  'doctor-3': { en: "'Since Monday' means it started then and is still true: use **I've been**.", bn: "'since Monday' মানে এখনো চলছে, তাই I've been ব্যবহার করুন।" },
  'street-4': { en: "Asking about time until now: **How long have you lived** here?", bn: "এখন পর্যন্ত কতদিন, তাই have you lived।" },
  'turnstile-3': { en: "Questions put 'can' first, and money goes **to** your card: Where **can I** add money **to** my card?", bn: "প্রশ্নে 'can' আগে, আর কার্ডে টাকা ভরতে 'to my card'।" },
  'platform-4': { en: "Yes/no questions need **Does** at the start: **Does** this train go…?", bn: "হ্যাঁ/না প্রশ্নে শুরুতে Does লাগে।" },
  'train-4': { en: "After 'need', add **to**: I need **to** get off.", bn: "'need'-এর পরে 'to' লাগে: need to get off।" },
  'transfer-4': { en: "Questions with 'which way' need **do**: Which way **do I** go?", bn: "'which way' প্রশ্নে do লাগে: Which way do I go?" },
  'exit-4': { en: "'How' questions need **do**: How **do I** get to…?", bn: "'How' দিয়ে প্রশ্নে do লাগে: How do I get…?" },
  'bus-4': { en: "Say **get to** a place (or arrive **at**), never arrive to.", bn: "জায়গায় পৌঁছাতে get to বা arrive at বলুন, arrive to না।" },
};

export interface Reply {
  /** The question shown after you hear the line. */
  ask: string;
  target: string;
  accept?: string[];
}

/** "Listen & answer" step: hear the line, then respond like in real life. */
export const REPLIES: Record<string, Reply> = {
  'deli-4': { ask: 'Say you need nothing else.', target: "No, that's all, thanks.", accept: ["No thanks that's it", "I'm all set thanks", 'No thank you'] },
  'deli-8': { ask: 'Say yes, everything.', target: 'Yes, everything please.', accept: ['Yeah everything', 'Everything please', 'Yes please'] },
  'subway-3': { ask: 'What should you do? Say it.', target: 'Stand back from the doors.', accept: ['Step back from the doors', 'Move away from the doors', 'Stand clear'] },
  'subway-6': { ask: 'What is the next stop?', target: 'Jay Street MetroTech.', accept: ['The next stop is Jay Street', 'Jay Street'] },
  'pharmacy-5': { ask: 'Answer with a date of birth.', target: 'It is March XNUM.', accept: ['My birthday is March XNUM', 'March XNUM', 'XNUM'] },
  'pharmacy-7': { ask: 'How long do you wait?', target: 'About twenty minutes.', accept: ['Twenty minutes', 'About 20 minutes'] },
  'laundromat-5': { ask: 'What time do they close?', target: 'At ten tonight.', accept: ['Ten', 'At ten', 'They close at ten'] },
  'laundromat-7': { ask: 'When can you get your laundry?', target: 'Tomorrow.', accept: ['I can pick it up tomorrow', 'Pick it up tomorrow'] },
  'doctor-4': { ask: 'Answer: hand it over politely.', target: 'Sure, here it is.', accept: ['Yes here you go', 'Sure here you go', 'Here it is'] },
  'doctor-7': { ask: 'How many times a day?', target: 'Twice a day after meals.', accept: ['Two times a day', 'Twice a day'] },
  'street-3': { ask: 'Which way do you turn?', target: 'Left, after two blocks.', accept: ['Turn left', 'Go two blocks and turn left', 'Left'] },
  'street-7': { ask: 'Where is it?', target: 'Across the street from the bank.', accept: ['Opposite the bank', 'Across from the bank'] },
  'turnstile-4': { ask: 'What do you do now?', target: 'I swipe again.', accept: ['Swipe again', 'I swipe my card again'] },
  'turnstile-7': { ask: 'Where do you get your money back?', target: 'At the booth.', accept: ['The booth', 'Go to the booth'] },
  'platform-3': { ask: 'How far away is the train?', target: 'Two stops away.', accept: ['Two stops', 'It is two stops away'] },
  'platform-6': { ask: 'Why are the trains late?', target: 'Because of signal problems.', accept: ['Signal problems', 'There are signal problems'] },
  'train-3': { ask: 'What is the next stop?', target: 'Union Square.', accept: ['The next stop is Union Square'] },
  'train-7': { ask: 'Is the train moving now?', target: "No, we're waiting.", accept: ['No it is stopped', "No we're held", 'No we are waiting'] },
  'transfer-3': { ask: 'Which trains can you take here?', target: 'The four, five and six.', accept: ['Four five and six', 'The 4 5 and 6 trains'] },
  'transfer-7': { ask: 'Where do the stairs take you?', target: 'To the downtown platform.', accept: ['The downtown platform', 'Downtown'] },
  'exit-3': { ask: 'Which exit, and how far?', target: 'The right exit, two blocks.', accept: ['Exit on the right and two blocks', 'Right exit two blocks'] },
  'exit-7': { ask: 'How long is the walk?', target: 'About ten minutes.', accept: ['Ten minutes', 'About 10 minutes on foot'] },
  'bus-3': { ask: 'How do you pay?', target: 'With coins, exact change.', accept: ['Exact change', 'Coins only', 'With coins'] },
  'bus-7': { ask: 'What should you do?', target: 'Wait for the next bus.', accept: ['Wait for the next one', 'Take the next bus'] },
};

/** The 8 phrases you learn before each world's race; the boss uses the first 6. */
export const PACKS: Record<1 | 2, string[]> = {
  1: ['deli-b1', 'deli-b2', 'deli-b3', 'deli-b4', 'deli-b5', 'deli-b6', 'street-2', 'doctor-5'],
  2: ['turnstile-b1', 'exit-b2', 'platform-b3', 'train-b4', 'train-b5', 'exit-b6', 'platform-1', 'transfer-2'],
};
