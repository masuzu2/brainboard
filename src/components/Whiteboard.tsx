"use client";

import { useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import "tldraw/tldraw.css";

import AIPanel from "./AIPanel";
import RoomBadge from "./RoomBadge";

export default function Whiteboard({ roomId }: { roomId: string }) {
  const store = useSyncDemo({ roomId: `brainboard-${roomId}` });
  const [editor, setEditor] = useState<Editor | null>(null);

  return (
    <div className="tldraw-host">
      <Tldraw store={store} onMount={(e) => setEditor(e)} />

      <RoomBadge roomId={roomId} />
      {editor && <AIPanel editor={editor} />}
    </div>
  );
}
