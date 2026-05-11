"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { makeRoomId } from "@/lib/storage";

export default function TemplatePicker() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(template: TemplateId) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#b388eb"],
    });
    const id = makeRoomId();
    const url =
      template === "blank" ? `/board/${id}` : `/board/${id}?template=${template}`;
    startTransition(() => {
      router.push(url);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={pending}
        className="wobble-border bg-coral px-8 py-4 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
      >
        {pending ? "opening..." : "✦ create a board"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[20px] border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.9)]"
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-4xl">
                start with a template
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-xl hover:bg-ink/5"
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => pick(t.id)}
                  className={`sticky-card ${t.accent} flex flex-col items-start gap-1 p-4 text-left transition-transform hover:scale-[1.02]`}
                >
                  <div className="text-3xl">{t.emoji}</div>
                  <div className="font-[family-name:var(--font-display)] text-2xl">
                    {t.name}
                  </div>
                  <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
