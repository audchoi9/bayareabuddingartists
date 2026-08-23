"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import {
  Lock,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  SlidersHorizontal,
  Images,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Maximize2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchCategories,
  softDeleteCategory,
  restoreCategory,
  slugify,
  type Category,
  type CategoryType,
} from "@/lib/categories";
import {
  fetchArtworks,
  softDeleteArtwork,
  restoreArtwork,
  type Artwork,
} from "@/lib/artwork";

const AUTH_KEY = "baba-admin-authed";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

type TabId = "categories" | "artwork" | "qr";

const TABS: { id: TabId; label: string; icon: typeof Images }[] = [
  { id: "categories", label: "Sessions & Species", icon: SlidersHorizontal },
  { id: "artwork", label: "Artwork", icon: Images },
  { id: "qr", label: "QR Code", icon: QrCode },
];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>("categories");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-dark">Admin</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem(AUTH_KEY);
            onLogout();
          }}
          className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-sm font-semibold text-dark transition hover:bg-black/10"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      <div className="mt-5 flex gap-1 rounded-full bg-black/5 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition",
              tab === id
                ? "bg-surface text-primary shadow-sm"
                : "text-muted hover:text-dark",
            ].join(" ")}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "categories" && (
          <div className="flex flex-col gap-10">
            <p className="text-sm text-muted">
              Add the sessions and species you&apos;ve run. Only these show up in
              the upload form and gallery filters. Deleting is a safe soft-delete
              — nothing is lost and photos are never touched.
            </p>
            <CategoryManager type="session" title="Sessions" placeholder="e.g. Session 1: Sea Otters" />
            <CategoryManager type="species" title="Species" placeholder="e.g. California Sea Otter" />
          </div>
        )}
        {tab === "artwork" && <ArtworkManager />}
        {tab === "qr" && <QRPanel />}
      </div>
    </div>
  );
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem(AUTH_KEY, "1");
        onSuccess();
      } else {
        setError(data.error ?? "Incorrect password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Lock size={26} />
        </span>
        <h1 className="text-2xl font-extrabold text-dark">Admin access</h1>
        <p className="text-sm text-muted">Enter the admin password to continue.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-dark outline-none focus:border-primary"
        />
        {error && (
          <p className="rounded-xl bg-secondary/15 px-4 py-3 text-sm font-semibold text-dark">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
          Unlock
        </button>
      </form>
    </div>
  );
}

function CategoryManager({
  type,
  title,
  placeholder,
}: {
  type: CategoryType;
  title: string;
  placeholder: string;
}) {
  const [items, setItems] = useState<Category[]>([]);
  const [trash, setTrash] = useState<Category[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [live, deleted] = await Promise.all([
        fetchCategories(type),
        fetchCategories(type, { deleted: true }),
      ]);
      setItems(live);
      setTrash(deleted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    const value = slugify(label);
    if (!value) {
      setError("Please use at least one letter or number.");
      return;
    }
    setAdding(true);
    setError(null);
    // If a soft-deleted item with the same value exists, restore it instead of
    // inserting a duplicate (the (type, value) pair is unique in the DB).
    const buried = trash.find((t) => t.value === value);
    if (buried) {
      await restoreCategory(buried.id);
      setAdding(false);
      setNewLabel("");
      load();
      return;
    }
    const nextSort = items.length ? Math.max(...items.map((i) => i.sort)) + 1 : 0;
    const { error } = await supabase
      .from("categories")
      .insert({ type, value, label, active: true, sort: nextSort });
    setAdding(false);
    if (error) {
      setError(error.code === "23505" ? `"${label}" already exists.` : error.message);
      return;
    }
    setNewLabel("");
    load();
  }

  async function toggle(item: Category) {
    await supabase.from("categories").update({ active: !item.active }).eq("id", item.id);
    load();
  }

  async function remove(item: Category) {
    if (
      !confirm(
        `Delete "${item.label}"? It moves to the recycle list below and photos keep their tag — you can restore it anytime.`,
      )
    )
      return;
    await softDeleteCategory(item.id);
    load();
  }

  async function restore(item: Category) {
    await restoreCategory(item.id);
    load();
  }

  return (
    <section>
      <h2 className="text-lg font-extrabold text-dark">{title}</h2>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-dark outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Add
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-xl bg-secondary/15 px-4 py-3 text-sm font-semibold text-dark">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-muted">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl bg-surface p-4 text-sm text-muted ring-1 ring-black/5">
            None yet. Add your first {type} above.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-black/5"
            >
              <div className={item.active ? "" : "opacity-50"}>
                <p className="font-semibold text-dark">{item.label}</p>
                <p className="text-xs text-muted">
                  {item.value}
                  {!item.active && " · hidden"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggle(item)}
                  title={item.active ? "Hide from uploads & filters" : "Show again"}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-black/5 hover:text-dark"
                >
                  {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => remove(item)}
                  title="Delete (recoverable)"
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-secondary/15 hover:text-dark"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {trash.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowTrash((s) => !s)}
            className="text-sm font-semibold text-muted underline-offset-2 hover:underline"
          >
            {showTrash ? "Hide" : "Show"} deleted ({trash.length})
          </button>
          {showTrash && (
            <div className="mt-2 flex flex-col gap-2">
              {trash.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.03] px-4 py-3 ring-1 ring-black/5"
                >
                  <div className="opacity-60">
                    <p className="font-semibold text-dark line-through">{item.label}</p>
                    <p className="text-xs text-muted">{item.value} · deleted</p>
                  </div>
                  <button
                    onClick={() => restore(item)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                  >
                    <RotateCcw size={16} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ArtworkManager() {
  const [items, setItems] = useState<Artwork[]>([]);
  const [trash, setTrash] = useState<Artwork[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [live, deleted] = await Promise.all([
        fetchArtworks(),
        fetchArtworks({ deleted: true }),
      ]);
      setItems(live);
      setTrash(deleted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(a: Artwork) {
    if (
      !confirm(
        `Remove "${a.title || a.display_name}" from the gallery? It moves to the recycle list below — you can restore it anytime.`,
      )
    )
      return;
    await softDeleteArtwork(a.id);
    load();
  }

  async function restore(a: Artwork) {
    await restoreArtwork(a.id);
    load();
  }

  return (
    <section>
      <h2 className="text-lg font-extrabold text-dark">Artwork</h2>
      <p className="mt-1 text-sm text-muted">
        Remove anything you don&apos;t want shown. Deletes are recoverable.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-secondary/15 px-4 py-3 text-sm font-semibold text-dark">
          {error}
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-muted">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl bg-surface p-4 text-sm text-muted ring-1 ring-black/5">
            No artwork in the gallery yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((a) => (
              <ArtThumb key={a.id} artwork={a} action="delete" onAction={() => remove(a)} />
            ))}
          </div>
        )}
      </div>

      {trash.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowTrash((s) => !s)}
            className="text-sm font-semibold text-muted underline-offset-2 hover:underline"
          >
            {showTrash ? "Hide" : "Show"} deleted artwork ({trash.length})
          </button>
          {showTrash && (
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {trash.map((a) => (
                <ArtThumb key={a.id} artwork={a} action="restore" onAction={() => restore(a)} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ArtThumb({
  artwork,
  action,
  onAction,
}: {
  artwork: Artwork;
  action: "delete" | "restore";
  onAction: () => void;
}) {
  const deleted = action === "restore";
  return (
    <div className="group relative overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/5">
      <div className={`relative aspect-square ${deleted ? "opacity-50" : ""}`}>
        <Image
          src={artwork.image_url}
          alt={artwork.title || artwork.display_name}
          fill
          sizes="(max-width: 640px) 33vw, 25vw"
          className="object-cover"
        />
      </div>
      <button
        onClick={onAction}
        title={deleted ? "Restore to gallery" : "Remove from gallery (recoverable)"}
        className={`absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full text-white shadow transition ${
          deleted ? "bg-primary/90 hover:bg-primary" : "bg-black/55 hover:bg-black/80"
        }`}
      >
        {deleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}
      </button>
      <p className="truncate px-2 py-1 text-[11px] font-semibold text-dark">
        {artwork.display_name}
      </p>
    </div>
  );
}

function QRPanel() {
  const [origin, setOrigin] = useState("");
  const [expanded, setExpanded] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Print or share these codes so kids and families can jump straight to a
        page by scanning with their phone camera. Click a code to blow it up
        full-screen for projecting.
      </p>

      {isLocal && (
        <p className="rounded-xl bg-secondary/15 px-4 py-3 text-sm font-semibold text-dark">
          Heads up: you&apos;re on <span className="font-mono">{origin}</span>, so
          these codes only work on this computer. Open your live site (the Vercel
          URL) and use this tab there to get codes anyone can scan.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <QRCard
          title="Add art"
          help="For kids & families to upload their artwork"
          url={origin ? `${origin}/upload` : ""}
          onExpand={setExpanded}
        />
        <QRCard
          title="Gallery"
          help="To view everyone's art"
          url={origin ? `${origin}/gallery` : ""}
          onExpand={setExpanded}
        />
      </div>

      {expanded && (
        <QRFullscreen
          title={expanded.title}
          url={expanded.url}
          onClose={() => setExpanded(null)}
        />
      )}
    </div>
  );
}

function QRCard({
  title,
  help,
  url,
  onExpand,
}: {
  title: string;
  help: string;
  url: string;
  onExpand: (v: { title: string; url: string }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    a.click();
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-5 text-center ring-1 ring-black/5">
      <h3 className="text-lg font-extrabold text-dark">{title}</h3>
      <p className="text-sm text-muted">{help}</p>

      <button
        type="button"
        onClick={() => url && onExpand({ title, url })}
        disabled={!url}
        title="Click to enlarge"
        className="group relative rounded-xl bg-white p-3 ring-1 ring-black/5 transition hover:ring-primary/40 disabled:cursor-default"
      >
        {url ? (
          <>
            <QRCodeCanvas
              ref={canvasRef}
              value={url}
              size={180}
              marginSize={2}
              fgColor="#263332"
              bgColor="#ffffff"
              level="M"
            />
            <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-dark/70 text-white opacity-0 transition group-hover:opacity-100">
              <Maximize2 size={14} />
            </span>
          </>
        ) : (
          <div className="grid h-[180px] w-[180px] place-items-center">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        )}
      </button>

      <p className="w-full truncate font-mono text-xs text-muted" title={url}>
        {url}
      </p>

      <div className="flex w-full gap-2">
        <button
          onClick={download}
          disabled={!url}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={copy}
          disabled={!url}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-black/5 px-3 py-2.5 text-sm font-semibold text-dark transition hover:bg-black/10 disabled:opacity-60"
        >
          {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function QRFullscreen({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) {
  // Size the QR to the viewport so it's crisp when projected.
  const [size, setSize] = useState(320);

  useEffect(() => {
    const calc = () =>
      setSize(Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.72));
    calc();
    window.addEventListener("resize", calc);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/5 text-dark transition hover:bg-black/10"
      >
        <X size={24} />
      </button>

      <h2 className="text-3xl font-extrabold text-dark sm:text-4xl">{title}</h2>

      <div onClick={(e) => e.stopPropagation()} className="rounded-2xl bg-white p-4">
        <QRCodeCanvas
          value={url}
          size={size}
          marginSize={2}
          fgColor="#263332"
          bgColor="#ffffff"
          level="M"
        />
      </div>

      <p className="font-mono text-sm text-muted sm:text-base">{url}</p>
      <p className="text-sm text-muted">Tap anywhere or press Esc to close</p>
    </div>
  );
}
