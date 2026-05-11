"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE_COLORS, useUserProfile } from "@/lib/useUserProfile";

export default function UserProfilePopover({
  className = "",
}: {
  className?: string;
}) {
  const { profile, update } = useUserProfile();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (open && profile) setDraftName(profile.name);
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) {
    return (
      <div
        className={`wobble-border bg-paper px-3 py-1 font-[family-name:var(--font-hand)] text-base ${className}`}
      >
        loading...
      </div>
    );
  }

  function commitName() {
    const name = draftName.trim();
    if (name && name !== profile?.name) update({ name });
  }

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="wobble-border flex items-center gap-2 bg-paper px-3 py-1 font-[family-name:var(--font-hand)] text-base"
      >
        <span
          className="size-4 rounded-full border-2 border-ink"
          style={{ backgroundColor: profile.color }}
        />
        <span>{profile.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[18px] border-2 border-ink bg-paper p-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
          <label className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            Display name
          </label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitName();
                setOpen(false);
              }
            }}
            maxLength={30}
            className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-3 py-1.5 font-[family-name:var(--font-hand)] text-base focus:outline-none"
          />
          <div className="mt-3 font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            Cursor color
          </div>
          <div className="mt-1 grid grid-cols-8 gap-1.5">
            {PROFILE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => update({ color: c })}
                className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  profile.color === c ? "border-ink" : "border-ink/20"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Set color ${c}`}
              />
            ))}
          </div>
          <p className="mt-3 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
            Shown to others when you collaborate.
          </p>
        </div>
      )}
    </div>
  );
}
