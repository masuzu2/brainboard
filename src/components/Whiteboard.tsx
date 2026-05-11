"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tldraw, type Editor } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";

import AIPanel from "./AIPanel";
import BoardHeader from "./BoardHeader";
import { drawShapes } from "@/lib/drawShapes";
import { recordVisit } from "@/lib/storage";
import { type TemplateId, templateSeed } from "@/lib/templates";

const TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set([
  "blank",
  "kanban",
  "mindmap",
  "flowchart",
  "retro",
]);

export default function Whiteboard({ roomId }: { roomId: string }) {
  const store = useSyncDemo({ roomId: `brainboard-${roomId}` });
  const [editor, setEditor] = useState<Editor | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const seededRef = useRef(false);
  const params = useSearchParams();
  const templateParam = params.get("template");
  const template: TemplateId =
    templateParam && TEMPLATE_IDS.has(templateParam as TemplateId)
      ? (templateParam as TemplateId)
      : "blank";

  useEffect(() => {
    if (!editor) return;
    if (store.status !== "synced-remote") return;
    if (seededRef.current) return;
    seededRef.current = true;

    recordVisit({ id: roomId, template });

    const existing = editor.getCurrentPageShapeIds().size;
    if (template !== "blank" && existing === 0) {
      const seed = templateSeed(template);
      if (seed.length > 0) {
        drawShapes(editor, seed, { origin: "center", focus: false });
        editor.zoomToFit({ animation: { duration: 400 } });
      }
    }
  }, [editor, store, roomId, template]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setAiOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="board-shell">
      <BoardHeader
        roomId={roomId}
        aiOpen={aiOpen}
        onToggleAi={() => setAiOpen((v) => !v)}
      />
      <div className="board-canvas">
        <Tldraw store={store} onMount={(e) => setEditor(e)} />
        {editor && aiOpen && (
          <AIPanel editor={editor} onClose={() => setAiOpen(false)} />
        )}
      </div>
    </div>
  );
}
