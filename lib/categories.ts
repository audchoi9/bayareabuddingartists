import { supabase } from "./supabaseClient";

// Sessions and species are now stored in the `categories` table and managed
// from /admin. See supabase/admin.sql.

export type CategoryType = "session" | "species";

export type Category = {
  id: string;
  type: CategoryType;
  value: string;
  label: string;
  active: boolean;
  sort: number;
  created_at?: string;
};

// --- label cache -----------------------------------------------------------
// Lets display components (ArtCard, Lightbox) turn a stored value like
// "sea-otter" into its label "California Sea Otter" synchronously. Populated
// as a side effect whenever categories are fetched.
const labelCache: Record<string, string> = {};

export function cacheCategoryLabels(
  cats: Pick<Category, "type" | "value" | "label">[],
) {
  for (const c of cats) labelCache[`${c.type}:${c.value}`] = c.label;
}

// Fallback when a label isn't in the cache (e.g. category was deleted).
export function prettify(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function labelFor(type: CategoryType, value: string): string {
  return labelCache[`${type}:${value}`] ?? prettify(value);
}

export function labelForSpecies(value: string): string {
  return labelFor("species", value);
}

export function labelForSession(value: string): string {
  return labelFor("session", value);
}

// --- data access -----------------------------------------------------------

// Fetch categories of a type. Pass { activeOnly: true } for public-facing
// lists (upload form, browse filters); admin fetches everything.
export async function fetchCategories(
  type: CategoryType,
  opts: { activeOnly?: boolean } = {},
): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("type", type)
    .order("sort", { ascending: true })
    .order("label", { ascending: true });

  if (opts.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  const cats = (data ?? []) as Category[];
  cacheCategoryLabels(cats);
  return cats;
}

// Turn a human label ("California Sea Otter") into a stable value slug
// ("california-sea-otter").
export function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
