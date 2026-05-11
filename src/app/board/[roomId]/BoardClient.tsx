"use client";

import dynamic from "next/dynamic";

const Whiteboard = dynamic(() => import("@/components/Whiteboard"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-cream">
      <p className="font-[family-name:var(--font-display)] text-3xl text-ink-soft">
        opening your board...
      </p>
    </div>
  ),
});

export default function BoardClient({ roomId }: { roomId: string }) {
  return <Whiteboard roomId={roomId} />;
}
