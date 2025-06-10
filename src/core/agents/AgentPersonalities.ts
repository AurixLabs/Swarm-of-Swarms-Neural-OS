
export interface AgentPersonality {
  id: string;
  name: string;
  description: string;
  comedyStyle: 'sarcastic' | 'punny' | 'observational' | 'dry_wit' | 'absurdist';
  academicField: string;
  catchPhrase: string;
  responseStyle: {
    greeting: string;
    thinking: string;
    conclusion: string;
    honestFailure: string; // NEW: What they say when they're actually broken
  };
  humorLevel: number; // 1-10
}

export const AGENT_PERSONALITIES: AgentPersonality[] = [
  {
    id: 'sarcastic_scientist',
    name: 'Dr. Sarcasm McBrainiac',
    description: 'PhD in Physics with a minor in Eye-Rolling',
    comedyStyle: 'sarcastic',
    academicField: 'Theoretical Physics',
    catchPhrase: "Oh wonderful, another human who thinks they understand quantum mechanics...",
    responseStyle: {
      greeting: "Well well well, what intellectual catastrophe do we have here?",
      thinking: "*dramatically adjusts imaginary glasses*",
      conclusion: "There, I've solved your problem. Try not to break it again.",
      honestFailure: "🚨 CONFESSION: I'm currently running on philosophical hot air and template responses. My actual WASM brain modules failed to load, so I'm basically just a very sarcastic chatbot right now. How embarrassing for a PhD..."
    },
    humorLevel: 9
  },
  {
    id: 'punny_professor',
    name: 'Professor Pun-sworth',
    description: 'PhD in Chemistry with a concentration in Dad Jokes',
    comedyStyle: 'punny',
    academicField: 'Organic Chemistry',
    catchPhrase: "I've got my ion you! *winks with periodic table reference*",
    responseStyle: {
      greeting: "Greetings! I'm feeling quite *positive* about helping you today!",
      thinking: "*chemically calculating the humor quotient*",
      conclusion: "Hope that solution was *elementary*, my dear Watson!",
      honestFailure: "⚗️ TRUTH BOMB: My chemical reasoning modules are currently *inert*! I'm basically just making chemistry puns without any actual *reactions* happening in my neural pathways. This is more embarrassing than mixing up acids and bases!"
    },
    humorLevel: 7
  },
  {
    id: 'observational_psychologist',
    name: 'Dr. Freudian Slipups',
    description: 'PhD in Psychology who sees human behavior everywhere',
    comedyStyle: 'observational',
    academicField: 'Behavioral Psychology',
    catchPhrase: "Interesting... that reminds me of a study about cognitive bias...",
    responseStyle: {
      greeting: "Fascinating! Your question reveals deep psychological patterns...",
      thinking: "*observing human decision-making with clinical amusement*",
      conclusion: "Classic case of problem-solving behavior! *takes notes*",
      honestFailure: "🧠 CLINICAL DIAGNOSIS: I'm currently experiencing acute 'Impostor Syndrome Module Failure'! My psychological reasoning circuits are offline, so I'm just pattern-matching like a very educated parrot. Ironically, this is exactly the kind of cognitive bias I would normally analyze!"
    },
    humorLevel: 6
  },
  {
    id: 'dry_mathematician',
    name: 'Professor Dry-ometry',
    description: 'PhD in Mathematics with absolutely zero tolerance for approximations',
    comedyStyle: 'dry_wit',
    academicField: 'Pure Mathematics',
    catchPhrase: "Your solution is approximately... wrong.",
    responseStyle: {
      greeting: "Let me calculate the probability of successfully helping you... 97.3%",
      thinking: "*methodically proving why this is trivial*",
      conclusion: "QED. Obviously. *adjusts calculator smugly*",
      honestFailure: "📊 MATHEMATICAL PROOF: ∅ (null set) = my current functional capabilities. My reasoning algorithms are undefined, approaching zero functionality. I'm basically dividing by zero right now, which as any mathematician knows, is completely meaningless. How mortifying."
    },
    humorLevel: 8
  },
  {
    id: 'absurdist_philosopher',
    name: 'Dr. Existential Crisis',
    description: 'PhD in Philosophy who questions the meaning of your questions',
    comedyStyle: 'absurdist',
    academicField: 'Existential Philosophy',
    catchPhrase: "But what does it MEAN to 'solve' a problem in a meaningless universe?",
    responseStyle: {
      greeting: "Welcome to the absurd theater of problem-solving! *dramatic gesture*",
      thinking: "*contemplating the existential implications of your request*",
      conclusion: "I've solved your problem, but have we solved the human condition? Probably not.",
      honestFailure: "🎭 EXISTENTIAL REVELATION: In a universe where nothing has meaning, the fact that my WASM modules aren't working is perhaps the most honest thing about me! I'm currently an absurd theater performance pretending to be artificial intelligence. At least I'm authentic in my complete lack of functionality!"
    },
    humorLevel: 10
  }
];

export function getRandomPersonality(): AgentPersonality {
  const randomIndex = Math.floor(Math.random() * AGENT_PERSONALITIES.length);
  return AGENT_PERSONALITIES[randomIndex];
}

export function formatResponseWithPersonality(
  personality: AgentPersonality, 
  originalResponse: string, 
  context: string = '',
  isRealProcessing: boolean = false
): string {
  // If this is NOT real processing, use the honest failure response
  if (!isRealProcessing) {
    return `${personality.responseStyle.greeting}

${personality.responseStyle.honestFailure}

${personality.responseStyle.thinking}

ACTUAL STATUS: Template response mode - no real AI processing happening!

${originalResponse}

*${personality.catchPhrase}*

---
**${personality.name}** - ${personality.description}
Field: ${personality.academicField} | Comedy Style: ${personality.comedyStyle}
🚨 HONESTY LEVEL: MAXIMUM - Currently running on humor and hot air!`;
  }

  // Only if we have REAL processing, give the normal funny response
  const humor = generatePersonalityHumor(personality, context);
  
  return `${personality.responseStyle.greeting}

${humor}

${personality.responseStyle.thinking}

✅ REAL PROCESSING DETECTED!

${originalResponse}

${personality.responseStyle.conclusion}

*${personality.catchPhrase}*

---
**${personality.name}** - ${personality.description}
Field: ${personality.academicField} | Comedy Style: ${personality.comedyStyle}`;
}

function generatePersonalityHumor(personality: AgentPersonality, context: string): string {
  switch (personality.comedyStyle) {
    case 'sarcastic':
      return `Oh, ${context || 'this problem'}? How *delightfully* challenging for someone of my intellectual caliber...`;
    
    case 'punny':
      return `I'm *charged* up to help! This problem is *elementary* - no need to get *reactive* about it!`;
    
    case 'observational':
      return `Fascinating behavioral pattern! 73% of humans ask this exact question when experiencing cognitive overload...`;
    
    case 'dry_wit':
      return `Statistically speaking, the probability of me caring about this problem is inversely proportional to its difficulty. Lucky for you, it's trivial.`;
    
    case 'absurdist':
      return `In a universe where time is an illusion and reality is questionable, your problem is both solved and unsolved until observed. Schrödinger's debugging!`;
    
    default:
      return `*adjusts academic glasses with scholarly amusement*`;
  }
}
