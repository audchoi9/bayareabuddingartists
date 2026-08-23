"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageOff, Loader2 } from "lucide-react";
import { fetchArtworks, type Artwork, type ArtworkFilters } from "@/lib/artwork";
import { fetchCategories } from "@/lib/categories";
import ArtCard from "./ArtCard";
import Lightbox from "./Lightbox";

export default function Gallery({ filters }: { filters?: ArtworkFilters }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Artwork | null>(null);

  const species = filters?.species;
  const session = filters?.session;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      // Best-effort: warm the label cache so cards show real labels.
      // Never let a missing categories table break the gallery.
      await Promise.allSettled([
        fetchCategories("species"),
        fetchCategories("session"),
      ]);
      try {
        const data = await fetchArtworks({ species, session });
        if (active) setArtworks(data);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [species, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="animate-spin" size={20} />
        Loading artwork…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-secondary/10 p-6 text-center text-dark">
        <p className="font-semibold">Couldn&apos;t load the gallery.</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-12 text-center ring-1 ring-black/5">
        <ImageOff size={40} className="text-muted" />
        <p className="text-lg font-bold text-dark">No artwork here yet</p>
        <p className="max-w-sm text-sm text-muted">
          Be the first to add a masterpiece to the gallery!
        </p>
        <Link
          href="/upload"
          className="mt-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-dark transition hover:brightness-105"
        >
          Add your art
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artworks.map((a) => (
          <ArtCard key={a.id} artwork={a} onOpen={setSelected} />
        ))}
      </div>
      <Lightbox artwork={selected} onClose={() => setSelected(null)} />
    </>
  );
}
