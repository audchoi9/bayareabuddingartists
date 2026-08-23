"use client";

import { useState } from "react";
import { SPECIES, SESSIONS } from "@/lib/categories";
import Gallery from "@/components/Gallery";

export default function BrowsePage() {
  const [species, setSpecies] = useState<string>("");
  const [session, setSession] = useState<string>("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Browse the gallery</h1>
        <p className="mt-1 text-muted">
          Narrow the art down by species or by workshop session.
        </p>
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
            {SPECIES.map((s) => (
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
            {SESSIONS.map((s) => (
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
