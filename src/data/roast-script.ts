export type RoastTone = 'jab' | 'bait' | 'deadpan';

export type RoastExchange = {
  id: string;
  setup: string;
  intent: 'rant' | 'heckle' | 'tantrum';
  intentText: string;
  responses: readonly {
    id: RoastTone;
    line: string;
    reaction: string;
  }[];
};

// The delivery changes the tactic; the player always chooses an actual line.
// Each opponent gets a different voice, rather than a shared insult generator.
export const ROAST_SCRIPT: readonly (readonly RoastExchange[])[] = [
  [
    {
      id: 'gamer-team',
      setup: "I'm only losing because this team is dogshit.",
      intent: 'rant',
      intentText: 'He is winding up another speech about his teammates.',
      responses: [
        { id: 'jab', line: 'Funny. They all got better the second you disconnected.', reaction: 'He checks the match history. Immediately closes it.' },
        { id: 'bait', line: "Go on. Name every teammate. We'll wait.", reaction: 'He starts listing usernames. Someone in the back knows one of them.' },
        { id: 'deadpan', line: "Mute him. His mum's trying to sleep.", reaction: 'A phone lights up in his pocket. MUM. Again.' },
      ],
    },
    {
      id: 'gamer-headset',
      setup: 'This headset cost more than your entire setup.',
      intent: 'heckle',
      intentText: 'He wants a quick reply he can shout over.',
      responses: [
        { id: 'jab', line: 'You spent three hundred quid to hear twelve-year-olds call you shit.', reaction: 'He takes one earcup off. The other is still shouting at him.' },
        { id: 'bait', line: 'Then use it. What did your teammates just call you?', reaction: 'He turns the volume down before anyone can hear.' },
        { id: 'deadpan', line: 'Nice. Who bought it?', reaction: 'He says “birthday money” too quietly for the mic.' },
      ],
    },
    {
      id: 'gamer-mum',
      setup: 'MUM! I SAID FIVE MINUTES!',
      intent: 'tantrum',
      intentText: 'He is about to make being interrupted everyone else’s problem.',
      responses: [
        { id: 'jab', line: "She's showing someone the spare room, mate. You're the reason it's going cheap.", reaction: 'He looks at the exit. The room notices.' },
        { id: 'bait', line: 'Tell her what you called yourself on Discord. The alpha thing.', reaction: 'He suddenly discovers the value of an indoor voice.' },
        { id: 'deadpan', line: "Take your time. Dinner's been cold since Tuesday.", reaction: 'He says he already ate. Nobody believes him.' },
      ],
    },
    {
      id: 'gamer-rank',
      setup: "I'm a top-one-percent player. You wouldn't understand.",
      intent: 'rant',
      intentText: 'He needs the room to believe his rank is a qualification.',
      responses: [
        { id: 'jab', line: "Top one percent of blokes who've punched a desk instead of getting a job.", reaction: 'He covers the split in his controller with his thumb.' },
        { id: 'bait', line: 'Show us the match history. Scroll. Keep scrolling.', reaction: 'He says the app is down. The app is visibly open.' },
        { id: 'deadpan', line: "Then why's your little brother got the account now?", reaction: '“He was just borrowing it.” From the front row: “I boosted you.”' },
      ],
    },
    {
      id: 'gamer-cheating',
      setup: 'He was wallhacking. He knew exactly where I was.',
      intent: 'heckle',
      intentText: 'He is fishing for someone to agree the loss was unfair.',
      responses: [
        { id: 'jab', line: 'You screamed “I’M FLANKING” into an open mic, you thick fuck.', reaction: 'He checks whether his own microphone is still on.' },
        { id: 'bait', line: 'Explain the replay. We want the bit where you missed twelve shots.', reaction: 'His explanation gets louder every time someone asks about the shots.' },
        { id: 'deadpan', line: 'Right. And the wall killed you the other eleven times?', reaction: 'He begins explaining the other eleven deaths. Nobody asked.' },
      ],
    },
    {
      id: 'gamer-controller',
      setup: 'I break controllers because I care about winning.',
      intent: 'tantrum',
      intentText: 'The controller is about to become a projectile.',
      responses: [
        { id: 'jab', line: "You threw it at a cushion and missed. That's the problem right there.", reaction: 'He looks at the controller on the floor. Well short of the cushion.' },
        { id: 'bait', line: "Do it again. The controller's still got more wins than you.", reaction: 'He raises it, spots his mum’s name on the screen, and puts it down.' },
        { id: 'deadpan', line: 'Does your mum buy those in bulk now?', reaction: '“She gets a discount.” He hears himself say it.' },
      ],
    },
  ],
  [
    {
      id: 'karen-mother',
      setup: 'What would your mother think of the way you speak to me?',
      intent: 'heckle',
      intentText: 'She wants an apology she can turn into another complaint.',
      responses: [
        { id: 'jab', line: 'She works retail. She fucking hates you.', reaction: 'Three people at the bar raise their staff discount cards.' },
        { id: 'bait', line: "Call her. Tell her what you did to the waitress first.", reaction: 'She starts the story. The waitress supplies the missing bit.' },
        { id: 'deadpan', line: 'She said I could stay out if you were here.', reaction: 'Karen looks for a second parent to complain to.' },
      ],
    },
    {
      id: 'karen-refund',
      setup: 'That meal was disgusting. I want a full refund.',
      intent: 'rant',
      intentText: 'She is building a speech around an empty plate.',
      responses: [
        { id: 'jab', line: "You're not getting a refund. You ate the fucking evidence.", reaction: 'She slides a clean plate underneath her handbag.' },
        { id: 'bait', line: "Which bit was disgusting? You licked the sauce off the fork.", reaction: 'She insists that was to check. The room waits for her to finish that thought.' },
        { id: 'deadpan', line: 'You asked for bread to finish it.', reaction: 'The waiter quietly sets down the bread receipt.' },
      ],
    },
    {
      id: 'karen-live',
      setup: "I'm filming this. Say it again for my followers.",
      intent: 'heckle',
      intentText: 'Her phone is up. She wants a clip with all the context missing.',
      responses: [
        { id: 'jab', line: "Both of them? Your estate agent and the bloke selling fake handbags?", reaction: 'She angles the screen away before anyone can read the viewer count.' },
        { id: 'bait', line: "Sure. Turn the camera round. Show them who you've been screaming at.", reaction: 'She keeps the camera firmly pointed away from the teenage waiter.' },
        { id: 'deadpan', line: "Your son's in the comments asking you to come home.", reaction: 'She stops filming to block him.' },
      ],
    },
    {
      id: 'karen-loyal',
      setup: "I've been coming here for twenty years. I deserve some respect.",
      intent: 'rant',
      intentText: 'She is about to tell the room how much she spends.',
      responses: [
        { id: 'jab', line: 'Twenty years and the staff still warn each other when your car pulls up.', reaction: 'The bartender fails to hide a small group chat.' },
        { id: 'bait', line: "What's the waiter's name? Twenty years. Give us one name.", reaction: 'She points and says “that one.” He has a name badge.' },
        { id: 'deadpan', line: 'Yeah. We know your order. Tap water, then an argument.', reaction: 'She demands to know who told you. The whole bar points at the tap.' },
      ],
    },
    {
      id: 'karen-husband',
      setup: 'My husband will hear about this when he gets home.',
      intent: 'tantrum',
      intentText: 'She is threatening to bring backup into the argument.',
      responses: [
        { id: 'jab', line: "He takes the long way home and you still think it's traffic.", reaction: 'She checks the time. Then checks it again.' },
        { id: 'bait', line: 'Ring him. Speakerphone. Ask where he is.', reaction: 'It goes to voicemail before the second ring.' },
        { id: 'deadpan', line: "He's at the bar. He asked us not to say.", reaction: 'A man behind a menu slowly lowers himself out of sight.' },
      ],
    },
    {
      id: 'karen-manager',
      setup: "Get me your manager. I'm not speaking to you.",
      intent: 'tantrum',
      intentText: 'She is trying to end the exchange by shouting over it.',
      responses: [
        { id: 'jab', line: "You're shouting at a teenager over a coupon. Have a fucking look at yourself.", reaction: 'She checks the coupon. It expired fourteen months ago.' },
        { id: 'bait', line: "What would you like him to do? Go on. Say it in front of everyone.", reaction: 'She says she wants someone fired. The room stops laughing at you.' },
        { id: 'deadpan', line: 'He saw you park. He’s on his break.', reaction: 'The staff-room lock clicks shut.' },
      ],
    },
  ],
  [
    {
      id: 'captcha-human',
      setup: 'Before we continue, please prove that you are human.',
      intent: 'heckle',
      intentText: 'He is demanding proof while carefully remembering to blink.',
      responses: [
        { id: 'jab', line: 'You invited me to a comedy club and asked me to identify buses. Get help.', reaction: 'He quietly closes a window containing nine pictures of buses.' },
        { id: 'bait', line: 'You go first. Phone your wife. No script.', reaction: 'His thumb hovers over a contact labelled HOUSEHOLD USER 2.' },
        { id: 'deadpan', line: 'My back hurts and I owe money. How much more proof do you need?', reaction: 'He offers to personalise a loan advert.' },
      ],
    },
    {
      id: 'captcha-suspicious',
      setup: 'We have detected suspicious activity on your account.',
      intent: 'rant',
      intentText: 'He is collecting more evidence than the question requires.',
      responses: [
        { id: 'jab', line: "That's rich from a bloke who followed me into a shoe advert.", reaction: 'An advert for those exact shoes appears on his screen.' },
        { id: 'bait', line: 'Which bit? Say it out loud. In front of everyone.', reaction: 'He starts reading. His lawyer in the front row stands up.' },
        { id: 'deadpan', line: 'Yeah. I clicked “reject all.”', reaction: 'He asks whether you are absolutely sure. Again.' },
      ],
    },
    {
      id: 'captcha-connection',
      setup: 'I understand human connection. It is very important to me.',
      intent: 'rant',
      intentText: 'He is preparing a rehearsed demonstration of sincerity.',
      responses: [
        { id: 'jab', line: 'You call your wife a daily active user.', reaction: 'He insists that is a term of affection in his household.' },
        { id: 'bait', line: "Hug someone. We'll count the seconds until security intervenes.", reaction: 'He approaches the bouncer with both arms held perfectly horizontal.' },
        { id: 'deadpan', line: 'You practised that in the car. I saw you.', reaction: 'He tries the sentence with a different smile. It is much worse.' },
      ],
    },
    {
      id: 'captcha-microphone',
      setup: 'To continue, please allow microphone access.',
      intent: 'heckle',
      intentText: 'He wants the microphone, your permission, and a little more data.',
      responses: [
        { id: 'jab', line: 'You heard me through the kettle. Stop fucking asking.', reaction: 'He looks at the kettle. Then pretends he did not.' },
        { id: 'bait', line: 'Sure. Tell the room what you heard last night.', reaction: 'He reaches for his notes. The lawyer stands up again.' },
        { id: 'deadpan', line: 'No. Last time I coughed, I got funeral ads.', reaction: 'He asks whether the offer was relevant to your interests.' },
      ],
    },
    {
      id: 'captcha-buses',
      setup: 'Select every square containing a bus. Please try again.',
      intent: 'tantrum',
      intentText: 'He is about to reset the grid and make you do it all again.',
      responses: [
        { id: 'jab', line: "You've made me find thirty buses. Use one. Go the fuck home.", reaction: 'He opens a route planner. It asks him to prove he is human.' },
        { id: 'bait', line: 'Which square has your actual personality? Take your time.', reaction: 'He selects the company logo. The grid rejects it.' },
        { id: 'deadpan', line: "That's a parked van. We both know it's a parked van.", reaction: 'He zooms in on one pixel of a wing mirror.' },
      ],
    },
    {
      id: 'captcha-consent',
      setup: 'By remaining in this venue, you agree to our updated terms.',
      intent: 'tantrum',
      intentText: 'He is trying to take ownership of a room that is laughing at him.',
      responses: [
        { id: 'jab', line: "You can't get a laugh, so you're trying to fucking license one.", reaction: 'He removes “audience-generated content” from the contract heading.' },
        { id: 'bait', line: "Read the whole thing out. Let's hear what you're hiding on page forty.", reaction: 'He reaches page forty. The lawyer puts his head in his hands.' },
        { id: 'deadpan', line: 'The venue kicked you out ten minutes ago. Check your email.', reaction: 'He opens it. There is a confirmation code.' },
      ],
    },
  ],
];

/** Rounds are zero-based. A show id varies its opening without changing on reload. */
export function roastExchange(round: number, turn: number, seed?: string): RoastExchange {
  const act = Number.isFinite(round) ? Math.max(0, Math.min(ROAST_SCRIPT.length - 1, Math.trunc(round))) : 0;
  const exchanges = ROAST_SCRIPT[act];
  const beat = Number.isFinite(turn) ? Math.trunc(turn) : 0;
  let offset = 0;
  if (seed !== undefined) {
    let hash = 2166136261;
    const key = `${seed}:${act}`;
    for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619) >>> 0;
    offset = hash % exchanges.length;
  }
  return exchanges[(((beat + offset) % exchanges.length) + exchanges.length) % exchanges.length];
}

export const ROAST_VOICES = {
  CC001: {
    intro: "Don't touch the mic settings. I've got them exactly right.",
    special: 'RUN IT BACK. THE FIRST ONE DIDN’T COUNT.',
    win: 'He says the mic had input lag. The mic is unplugged.',
    lose: 'He saves the clip before you’ve even left the stage.',
  },
  CC026: {
    intro: 'Who booked this? I need a name.',
    special: 'I WANT THIS PERSON REMOVED. RIGHT NOW.',
    win: 'She demands the entry fee back. She was on the guest list.',
    lose: 'She tells the room she has never been treated so well.',
  },
  CC031: {
    intro: 'Hello, fellow people. I am enjoying this voluntarily.',
    special: 'YOU MAY APPEAL THIS DECISION TO ME.',
    win: 'He leaves. Your phone asks you to rate the encounter.',
    lose: 'He asks for a selfie. You are tagged before he takes it.',
  },
} as const;
