"use client";

import { useEffect, useState } from "react";
import { Lock, Plus, Trash2, Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchCategories,
  slugify,
  type Category,
  type CategoryType,
} from "@/lib/categories";

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-dark">Admin</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem(AUTH_KEY);
            setAuthed(false);
          }}
          className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-sm font-semibold text-dark transition hover:bg-black/10"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
      <p className="mt-1 text-muted">
        Add the sessions and species you&apos;ve run. Only these show up in the
        upload form and the gallery filters. Hide one to keep its past art but
        stop new uploads to it.
      </p>

      <div className="mt-8 flex flex-col gap-10">
        <CategoryManager type="session" title="Sessions" placeholder="e.g. Session 1: Sea Otters" />
        <CategoryManager type="species" title="Species" placeholder="e.g. California Sea Otter" />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchCategories(type));
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
    const nextSort = items.length ? Math.max(...items.map((i) => i.sort)) + 1 : 0;
    const { error } = await supabase
      .from("categories")
      .insert({ type, value, label, active: true, sort: nextSort });
    setAdding(false);
    if (error) {
      setError(
        error.code === "23505"
          ? `"${label}" already exists.`
          : error.message,
      );
      return;
    }
    setNewLabel("");
    load();
  }

  async function toggle(item: Category) {
    await supabase
      .from("categories")
      .update({ active: !item.active })
      .eq("id", item.id);
    load();
  }

  async function remove(item: Category) {
    if (!confirm(`Delete "${item.label}"? Past art keeps its tag but this option disappears.`))
      return;
    await supabase.from("categories").delete().eq("id", item.id);
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
                  title="Delete"
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-secondary/15 hover:text-dark"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
