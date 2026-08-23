import Link from "next/link";
import { Upload, Search } from "lucide-react";
import Gallery from "@/components/Gallery";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
          A gallery by the Bay Area&apos;s budding artists 🎨🌱
        </h1>
        <p className="mt-3 max-w-xl text-white/90">
          Young artists explore the native plants and animals of the Bay Area —
          then draw what they learn. Browse every masterpiece below.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-dark transition hover:brightness-105"
          >
            <Upload size={18} />
            Add your art
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/25"
          >
            <Search size={18} />
            Browse by species &amp; session
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-dark">Everyone&apos;s art</h2>
        <Gallery />
      </section>
    </div>
  );
}
