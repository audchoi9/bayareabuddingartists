"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Artwork } from "@/lib/artwork";
import { labelForSpecies, labelForSession } from "@/lib/categories";

export default function ArtCard({
  artwork,
  onOpen,
}: {
  artwork: Artwork;
  onOpen: (a: Artwork) => void;
}) {
  return (
    <button
      onClick={() => onOpen(artwork)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-black/5">
        <Image
          src={artwork.image_url}
          alt={artwork.title || "Artwork"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        {artwork.title && (
          <p className="truncate text-sm font-bold text-dark">{artwork.title}</p>
        )}
        <p className="flex items-center gap-1 text-sm text-primary">
          {artwork.is_anonymous && <Sparkles size={14} />}
          <span className="truncate font-semibold">{artwork.display_name}</span>
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {artwork.species && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {labelForSpecies(artwork.species)}
            </span>
          )}
          {artwork.session && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {labelForSession(artwork.session)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
