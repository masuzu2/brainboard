"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShareModal from "./ShareModal";
import UserProfilePopover from "./UserProfilePopover";

export default function BoardHeader({ roomId }: { roomId: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, [roomId]);

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-2">
        <Link
          href="/"
          className="wobble-border pointer-events-auto bg-paper px-3 py-1 font-[family-name:var(--font-display)] text-xl"
        >
          ← brainboard
        </Link>
        <button
          onClick={() => setShareOpen(true)}
          className="wobble-border pointer-events-auto bg-sun px-3 py-1 font-[family-name:var(--font-hand)] text-base"
          title="Open share dialog"
        >
          🔗 invite · {roomId}
        </button>
      </div>

      <div className="pointer-events-none absolute right-4 bottom-4 z-30">
        <div className="pointer-events-auto">
          <UserProfilePopover />
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={url}
        roomId={roomId}
      />
    </>
  );
}
