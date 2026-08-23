"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Images, Search, Upload } from "lucide-react";

const NAV = [
  { href: "/", label: "Gallery", icon: Images },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/upload", label: "Add Art", icon: Upload },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
            <Leaf size={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-dark">
              Bay Area Budding Artists
            </span>
            <span className="block text-xs text-muted">
              Native plants &amp; animals, drawn by kids
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const isCta = href === "/upload";
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition",
                  isCta
                    ? "bg-secondary text-dark hover:brightness-105"
                    : active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-black/5 hover:text-dark",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
