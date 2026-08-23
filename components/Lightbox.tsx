"use client";

import Image from "next/image";
import { X, Sparkles } from "lucide-react";
import type { Artwork } from "@/lib/artwork";
import { labelForSpecies, labelForSession } from "@/lib/categories";

export default function Lightbox({
  artwork,
  onClose,
}: {
  artwork: Artwork | null;
  onClose: () => void;
}) {
  if (!artwork) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          <X size={20} />
        </button>

        <div className="relative max-h-[65vh] w-full bg-black/5">
          <div className="relative mx-auto aspect-square max-h-[65vh] w-full">
            <Image
              src={artwork.image_url}
              alt={artwork.title || "Artwork"}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {artwork.title && (
            <h2 className="text-xl font-extrabold text-dark">{artwork.title}</h2>
          )}
          <p className="flex items-center gap-1.5 text-base font-semibold text-primary">
            {artwork.is_anonymous && <Sparkles size={16} />}
            by {artwork.display_name}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {artwork.species && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {labelForSpecies(artwork.species)}
              </span>
            )}
            {artwork.session && (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                {labelForSession(artwork.session)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
