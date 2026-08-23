"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchCategories, type Category } from "@/lib/categories";
import Gallery from "@/components/Gallery";

export default function BrowsePage() {
  const [species, setSpecies] = useState<string>("");
  const [session, setSession] = useState<string>("");

  const [speciesList, setSpeciesList] = useState<Category[]>([]);
  const [sessionList, setSessionList] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories("species", { activeOnly: true }).then(setSpeciesList).catch(() => {});
    fetchCategories("session", { activeOnly: true }).then(setSessionList).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Filter the gallery</h1>
          <p className="mt-1 text-muted">
            Narrow the art down by species or by workshop session.
          </p>
        </div>
        <Link
          href="/gallery"
          className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-primary ring-1 ring-primary/20 transition hover:bg-primary/5"
        >
          <ArrowLeft size={18} />
          Back to full gallery
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 ring-1 ring-black/5 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-dark">Species</span>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="rounded-xl border border-black/10 bg-background px-3 py-2.5 text-dark outline-none focus:border-primary"
          >
            <option value="">All species</option>
            {speciesList.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-dark">Session</span>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="rounded-xl border border-black/10 bg-background px-3 py-2.5 text-dark outline-none focus:border-primary"
          >
            <option value="">All sessions</option>
            {sessionList.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {(species || session) && (
          <button
            onClick={() => {
              setSpecies("");
              setSession("");
            }}
            className="rounded-xl bg-black/5 px-4 py-2.5 text-sm font-semibold text-dark transition hover:bg-black/10"
          >
            Clear filters
          </button>
        )}
      </div>

      <Gallery
        filters={{
          species: species || undefined,
          session: session || undefined,
        }}
      />
    </div>
  );
}
