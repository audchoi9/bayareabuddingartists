import { supabase, ARTWORK_BUCKET } from "./supabaseClient";

// A single artwork submission as stored in the `submissions` table.
export type Artwork = {
  id: string;
  image_url: string;
  display_name: string; // either the kid's chosen name or an auto nickname
  is_anonymous: boolean;
  species: string | null;
  session: string | null;
  title: string | null;
  created_at: string;
  deleted_at: string | null; // soft-delete timestamp; null = live
};

export type ArtworkFilters = {
  species?: string;
  session?: string;
  deleted?: boolean; // false (default) = live only; true = soft-deleted only
};

// Fetch artworks, newest first, optionally filtered by species/session.
// By default only live (not soft-deleted) artworks are returned.
export async function fetchArtworks(filters: ArtworkFilters = {}): Promise<Artwork[]> {
  let query = supabase
    .from("submissions")
    .select("*")
    // Only rows with a real http(s) image URL — guards next/image against
    // malformed/legacy rows that would otherwise crash the gallery.
    .like("image_url", "http%")
    .order("created_at", { ascending: false });

  if (filters.deleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (filters.species) query = query.eq("species", filters.species);
  if (filters.session) query = query.eq("session", filters.session);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Artwork[];
}

// Soft-delete: hide an artwork from the gallery but keep it (recoverable).
export async function softDeleteArtwork(id: string): Promise<void> {
  const { error } = await supabase
    .from("submissions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// Restore a soft-deleted artwork back to the gallery.
export async function restoreArtwork(id: string): Promise<void> {
  const { error } = await supabase
    .from("submissions")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw error;
}

export type NewArtwork = {
  file: File;
  displayName: string;
  isAnonymous: boolean;
  species: string | null;
  session: string | null;
  title: string | null;
};

// Uploads the image to Storage, then inserts a row in `submissions`.
export async function createArtwork(input: NewArtwork): Promise<Artwork> {
  const ext = input.file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Unique-ish path without needing an auth session.
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${Date.now()}-${rand}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ARTWORK_BUCKET)
    .upload(path, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type || undefined,
    });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(path);

  const { data, error: insertError } = await supabase
    .from("submissions")
    .insert({
      image_url: publicUrl,
      display_name: input.displayName,
      is_anonymous: input.isAnonymous,
      species: input.species,
      session: input.session,
      title: input.title,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data as Artwork;
}
