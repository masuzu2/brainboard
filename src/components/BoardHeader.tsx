"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShareModal from "./ShareModal";
import UserProfilePopover from "./UserProfilePopover";

export default function BoardHeader({
  roomId,
  aiOpen,
  onToggleAi,
}: {
  roomId: string;
  aiOpen: boolean;
  onToggleAi: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, [roomId]);

  return (
    <>
      <header className="board-header">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="wobble-border bg-paper px-3 py-1 font-[family-name:var(--font-display)] text-xl shrink-0"
          >
            ← brainboard
          </Link>
          <button
            onClick={() => setShareOpen(true)}
            className="wobble-border bg-sun px-3 py-1 font-[family-name:var(--font-hand)] text-base shrink-0"
            title="Open share dialog"
          >
            🔗 invite · {roomId}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAi}
            className={`wobble-border px-4 py-1 font-[family-name:var(--font-display)] text-xl ${
              aiOpen ? "bg-ink text-paper" : "bg-grape text-paper"
            }`}
            title={aiOpen ? "Hide AI panel (Ctrl+K)" : "Show AI panel (Ctrl+K)"}
          >
            ✦ ai{" "}
            <kbd className="ml-1 rounded border border-paper/40 px-1 font-mono text-[10px]">
              ⌃K
            </kbd>
          </button>
          <UserProfilePopover />
        </div>
      </header>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={url}
        roomId={roomId}
      />
    </>
  );
}
