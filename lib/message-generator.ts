interface GenerateArgs {
  recipientName: string;
  relationship: string;
  emotion: string;
  tone: string;
  occasion: string | null;
  seed: number;
}

const OPENERS: Record<string, string[]> = {
  heartfelt: ["From the bottom of my heart,", "I don't say this enough, but", "Every year I think about how grateful I am for you, and"],
  funny: ["Okay, don't let this go to your head, but", "Warning: sincere thoughts ahead —", "I was going to write something short, but then I remembered how great you are, so"],
  formal: ["On this special occasion,", "It is with great warmth that", "Please accept my heartfelt wishes as"],
  professional: ["On behalf of the whole team,", "As we celebrate this milestone,", "It's a privilege to"],
  romantic: ["Every moment with you feels like a gift, and", "My favorite person in the world —", "If I could bottle this feeling up, I would, because"],
  religious: ["With gratitude for the blessings we share,", "May this day be filled with grace, because", "Giving thanks for you today,"],
  inspirational: ["You remind me that the best things take courage, and", "Here's to chasing every dream, because", "May this next chapter be your boldest yet —"],
};

const BODIES: Record<string, string[]> = {
  heartfelt: ["{name}, you make every ordinary day feel a little more special.", "{name}, I'm endlessly thankful to have you in my life.", "{name}, thank you for always showing up for the people you love."],
  funny: ["{name}, you're basically the main character energy this family needed.", "{name}, aging like fine wine — or at least like a decent cheese.", "{name}, still the funniest person in every group chat."],
  formal: ["{name} has shown remarkable grace and dedication.", "we extend our warmest congratulations to {name}.", "{name} continues to inspire everyone around them."],
  professional: ["we want to recognize {name}'s outstanding contributions.", "{name} has been an invaluable part of this team's success.", "{name}'s dedication continues to set the standard for excellence."],
  romantic: ["{name}, you are my favorite hello and my hardest goodbye.", "{name}, loving you is the easiest thing I've ever done.", "{name}, every love song makes a little more sense because of you."],
  religious: ["may {name} be surrounded by peace, love, and light today and always.", "we pray for {name}'s continued health and happiness.", "may {name}'s path be blessed in the year ahead."],
  inspirational: ["{name}, the world is better with your light in it.", "{name}, may this next chapter be even braver than the last.", "{name}, keep going — everything you've dreamed of is closer than you think."],
};

const CLOSERS = ["Wishing you all the joy in the world.", "With so much love.", "Here's to celebrating you today.", "Sending you the biggest hug.", "Cheers to you, always."];

function pick<T>(arr: T[], seed: number, offset = 0) {
  return arr[(seed + offset) % arr.length];
}

export function generateMessage({ recipientName, relationship, emotion, tone, occasion, seed }: GenerateArgs) {
  const name = recipientName.trim() || "you";
  const opener = pick(OPENERS[tone] ?? OPENERS.heartfelt, seed, 0);
  const bodyTemplate = pick(BODIES[tone] ?? BODIES.heartfelt, seed, 1);
  const body = bodyTemplate.replace("{name}", name);
  const closer = pick(CLOSERS, seed, 2);
  const occasionNote = occasion ? ` Happy ${occasion.replace(/-/g, " ")}!` : "";

  return `${opener} ${body}${occasionNote} ${closer}`.replace(/\s+/g, " ").trim();
}

export const RELATIONSHIPS = ["Parent", "Sibling", "Partner", "Friend", "Grandparent", "Colleague", "Child", "Mentor"];
export const EMOTIONS = ["Joyful", "Grateful", "Proud", "Nostalgic", "Excited", "Loving"];
export const TONES = [
  { id: "heartfelt", label: "Heartfelt" },
  { id: "funny", label: "Funny" },
  { id: "formal", label: "Formal" },
  { id: "professional", label: "Professional" },
  { id: "romantic", label: "Romantic" },
  { id: "religious", label: "Religious" },
  { id: "inspirational", label: "Inspirational" },
];
