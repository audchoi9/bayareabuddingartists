// Shared category options used by the upload form and the browse filters.
// These are Bay Area–native species grouped by the workshop sessions.
// Edit these lists as your program's sessions evolve.

export type Category = {
  label: string;
  value: string;
};

// Workshop sessions. `value` is what we store in the database.
export const SESSIONS: Category[] = [
  { label: "Session 1", value: "session-1" },
  { label: "Session 2", value: "session-2" },
  { label: "Session 3", value: "session-3" },
  { label: "Session 4", value: "session-4" },
  { label: "Session 5", value: "session-5" },
  { label: "Session 6", value: "session-6" },
];

// Native Bay Area species the kids draw. Grouped loosely by kind.
export const SPECIES: Category[] = [
  // Animals
  { label: "California Sea Otter", value: "sea-otter" },
  { label: "California Quail", value: "california-quail" },
  { label: "Western Monarch Butterfly", value: "monarch-butterfly" },
  { label: "California Newt", value: "california-newt" },
  { label: "Coyote", value: "coyote" },
  { label: "Harbor Seal", value: "harbor-seal" },
  { label: "Anna's Hummingbird", value: "annas-hummingbird" },
  { label: "Banana Slug", value: "banana-slug" },
  { label: "Western Pond Turtle", value: "western-pond-turtle" },
  { label: "Brown Pelican", value: "brown-pelican" },
  // Plants
  { label: "California Poppy", value: "california-poppy" },
  { label: "Coast Redwood", value: "coast-redwood" },
  { label: "Coast Live Oak", value: "coast-live-oak" },
  { label: "Sticky Monkey-Flower", value: "monkey-flower" },
  { label: "Giant Kelp", value: "giant-kelp" },
];

export function labelForSpecies(value: string): string {
  return SPECIES.find((s) => s.value === value)?.label ?? value;
}

export function labelForSession(value: string): string {
  return SESSIONS.find((s) => s.value === value)?.label ?? value;
}
