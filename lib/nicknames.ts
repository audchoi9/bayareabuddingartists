// Auto-generates a fun, kid-friendly nickname for anonymous artists,
// e.g. "Curious Otter" or "Brave Salamander".
// Uses random adjectives + Bay Area animals.

const ADJECTIVES = [
  "Curious",
  "Brave",
  "Sunny",
  "Clever",
  "Gentle",
  "Speedy",
  "Sparkly",
  "Mighty",
  "Cozy",
  "Playful",
  "Wandering",
  "Bubbly",
  "Cheerful",
  "Dreamy",
  "Fuzzy",
  "Jolly",
  "Lucky",
  "Nimble",
  "Plucky",
  "Zippy",
];

const ANIMALS = [
  "Otter",
  "Quail",
  "Salamander",
  "Newt",
  "Hummingbird",
  "Pelican",
  "Seal",
  "Coyote",
  "Turtle",
  "Slug",
  "Butterfly",
  "Fox",
  "Heron",
  "Deer",
  "Raccoon",
  "Frog",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNickname(): string {
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
}
