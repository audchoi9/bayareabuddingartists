import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import Gallery from "@/components/Gallery";

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-dark">Gallery</h1>
        <Link
          href="/browse"
          className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-primary ring-1 ring-primary/20 transition hover:bg-primary/5"
        >
          <SlidersHorizontal size={18} />
          Filter
        </Link>
      </div>

      <Gallery />
    </div>
  );
}
