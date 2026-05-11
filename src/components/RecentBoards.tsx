"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type RecentBoard,
  getRecentBoards,
  removeBoard,
  renameBoard,
} from "@/lib/storage";

export default function RecentBoards() {
  const [boards, setBoards] = useState<RecentBoard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    function refresh() {
      setBoards(getRecentBoards());
    }
    refresh();
    window.addEventListener("brainboard:recent-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("brainboard:recent-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (boards.length === 0) return null;

  return (
    <section className="relative z-10 mt-16 w-full max-w-3xl">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-3xl">
        Your recent boards
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {boards.map((b) => (
          <li
            key={b.id}
            className="wobble-border group flex items-center gap-2 bg-paper px-3 py-2"
          >
            {editingId === b.id ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  renameBoard(b.id, draft);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameBoard(b.id, draft);
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
                className="min-w-0 flex-1 rounded-md border border-ink/30 bg-cream px-2 py-0.5 font-[family-name:var(--font-hand)] text-base focus:outline-none"
              />
            ) : (
              <Link
                href={`/board/${b.id}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span className="truncate font-[family-name:var(--font-hand)] text-lg">
                  {b.name}
                </span>
                {b.template && b.template !== "blank" && (
                  <span className="rounded-md border border-ink/20 bg-cream px-1.5 py-0.5 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                    {b.template}
                  </span>
                )}
              </Link>
            )}

            <span className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
              {fmt(b.visitedAt)}
            </span>
            <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  setEditingId(b.id);
                  setDraft(b.name);
                }}
                className="rounded-md px-1.5 py-0.5 text-sm hover:bg-ink/5"
                aria-label={`Rename ${b.name}`}
                title="Rename"
              >
                ✎
              </button>
              <button
                onClick={() => removeBoard(b.id)}
                className="rounded-md px-1.5 py-0.5 text-sm hover:bg-ink/5"
                aria-label={`Forget ${b.name}`}
                title="Remove from list"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function fmt(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  const date = new Date(ts);
  return date.toLocaleDateString();
}
