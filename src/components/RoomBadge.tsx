"use client";

import Link from "next/link";
import { useState } from "react";

export default function RoomBadge({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-30 flex items-center gap-2">
      <Link
        href="/"
        className="wobble-border bg-paper px-3 py-1 font-[family-name:var(--font-display)] text-xl"
      >
        ← brainboard
      </Link>
      <button
        onClick={copy}
        className="wobble-border bg-sun px-3 py-1 font-[family-name:var(--font-hand)] text-base"
        title="Copy room link to invite collaborators"
      >
        {copied ? "✓ link copied!" : `🔗 invite · ${roomId}`}
      </button>
    </div>
  );
}
