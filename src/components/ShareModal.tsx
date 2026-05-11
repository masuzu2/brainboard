"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "./Toast";

export default function ShareModal({
  open,
  onClose,
  url,
  roomId,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  roomId: string;
}) {
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.show(`${label} copied!`, "success");
    } catch {
      toast.show("Couldn't copy, try selecting manually.", "error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[20px] border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.9)]"
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-4xl">
            invite to board
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xl hover:bg-ink/5"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <p className="mb-4 font-[family-name:var(--font-hand)] text-base text-ink-soft">
          Share this link or QR code. Anyone who opens it will join the same
          live board — see your cursor, your edits, in real time.
        </p>

        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-ink bg-cream p-4">
          <div className="rounded-xl bg-paper p-3">
            <QRCodeSVG value={url} size={180} level="M" />
          </div>
          <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            scan to join
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <CopyRow label="Full link" value={url} onCopy={() => copy(url, "Link")} />
          <CopyRow label="Room id" value={roomId} onCopy={() => copy(roomId, "Room id")} />
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-paper px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="font-[family-name:var(--font-hand)] text-xs uppercase tracking-wider text-ink-soft">
          {label}
        </div>
        <div className="truncate font-mono text-sm">{value}</div>
      </div>
      <button
        onClick={onCopy}
        className="wobble-border bg-sun px-3 py-1 font-[family-name:var(--font-hand)] text-sm"
      >
        copy
      </button>
    </div>
  );
}
