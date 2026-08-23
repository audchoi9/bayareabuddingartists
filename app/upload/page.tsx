"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Sparkles, RefreshCw, ImagePlus, CheckCircle2, Loader2 } from "lucide-react";
import { fetchCategories, type Category } from "@/lib/categories";
import { generateNickname } from "@/lib/nicknames";
import { createArtwork } from "@/lib/artwork";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState(() => generateNickname());

  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState("");
  const [session, setSession] = useState("");

  const [speciesList, setSpeciesList] = useState<Category[]>([]);
  const [sessionList, setSessionList] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories("species", { activeOnly: true }).then(setSpeciesList).catch(() => {});
    fetchCategories("session", { activeOnly: true }).then(setSessionList).catch(() => {});
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onPickFile(f: File | null) {
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please choose a photo of the artwork first.");
      return;
    }
    const displayName = isAnonymous ? nickname : name.trim();
    if (!isAnonymous && !displayName) {
      setError("Please add a name, or choose to stay anonymous.");
      return;
    }

    setSubmitting(true);
    try {
      await createArtwork({
        file,
        displayName,
        isAnonymous,
        species: species || null,
        session: session || null,
        title: title.trim() || null,
      });
      setDone(true);
      setTimeout(() => router.push("/gallery"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <CheckCircle2 size={56} className="text-primary" />
        <h1 className="text-2xl font-extrabold text-dark">Added to the gallery!</h1>
        <p className="text-muted">Taking you to see it…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold text-dark">Add art to the gallery</h1>
      <p className="mt-1 text-muted">
        No account needed — just add a photo and share it with everyone.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
        {/* Photo picker */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark">Photo of the artwork</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-surface p-6 text-center transition hover:border-primary/60"
          >
            {preview ? (
              <span className="relative h-56 w-full overflow-hidden rounded-xl">
                <Image src={preview} alt="Preview" fill className="object-contain" />
              </span>
            ) : (
              <>
                <ImagePlus size={40} className="text-primary" />
                <span className="font-semibold text-dark">Tap to choose a photo</span>
                <span className="text-sm text-muted">JPG, PNG, or HEIC</span>
              </>
            )}
          </button>
          {preview && (
            <p className="mt-2 text-center text-sm text-muted">
              Tap the photo again to pick a different one.
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Title */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-dark">
            Title <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My California Poppy"
            className="rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-dark outline-none focus:border-primary"
          />
        </label>

        {/* Artist name / anonymous */}
        <div className="rounded-2xl bg-surface p-4 ring-1 ring-black/5">
          <span className="text-sm font-bold text-dark">Who made this?</span>

          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            <span className="flex items-center gap-1.5 text-dark">
              <Sparkles size={16} className="text-primary" />
              Stay anonymous with a fun nickname
            </span>
          </label>

          {isAnonymous ? (
            <div className="mt-3 flex items-center gap-3">
              <span className="flex-1 rounded-xl bg-primary/10 px-3 py-2.5 font-bold text-primary">
                {nickname}
              </span>
              <button
                type="button"
                onClick={() => setNickname(generateNickname())}
                className="flex items-center gap-1.5 rounded-xl bg-black/5 px-3 py-2.5 text-sm font-semibold text-dark transition hover:bg-black/10"
              >
                <RefreshCw size={16} />
                Shuffle
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Artist's name"
              className="mt-3 w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-dark outline-none focus:border-primary"
            />
          )}
        </div>

        {/* Species + session */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-dark">
              Species <span className="font-normal text-muted">(optional)</span>
            </span>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              disabled={speciesList.length === 0}
              className="rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-dark outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="">
                {speciesList.length ? "Choose a species" : "No species added yet"}
              </option>
              {speciesList.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-dark">
              Session <span className="font-normal text-muted">(optional)</span>
            </span>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              disabled={sessionList.length === 0}
              className="rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-dark outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="">
                {sessionList.length ? "Choose a session" : "No sessions added yet"}
              </option>
              {sessionList.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-secondary/15 px-4 py-3 text-sm font-semibold text-dark">
            {error}
          </p>
        )}

        <div className="sticky bottom-4 z-10 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={22} />
                Upload artwork now
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
