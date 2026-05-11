"use client";

import { useState } from "react";
import {
  type Editor,
  type TLShapeId,
  toRichText,
  createShapeId,
} from "tldraw";

type Tab = "sketch" | "diagram" | "summary";

export default function AIPanel({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("sketch");

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="wobble-border absolute right-4 top-4 z-30 bg-grape px-4 py-2 font-[family-name:var(--font-display)] text-2xl text-paper"
        >
          ✦ ai
        </button>
      )}

      {open && (
        <aside className="absolute right-4 top-4 z-30 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[18px] border-2 border-ink bg-paper p-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
          <header className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              ✦ ai tools
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 font-[family-name:var(--font-hand)] text-lg hover:bg-ink/5"
              aria-label="Close panel"
            >
              ✕
            </button>
          </header>

          <nav className="grid grid-cols-3 gap-1 rounded-xl bg-cream p-1">
            <TabButton active={tab === "sketch"} onClick={() => setTab("sketch")}>
              ✏️ Code
            </TabButton>
            <TabButton
              active={tab === "diagram"}
              onClick={() => setTab("diagram")}
            >
              📐 Diagram
            </TabButton>
            <TabButton
              active={tab === "summary"}
              onClick={() => setTab("summary")}
            >
              📝 Notes
            </TabButton>
          </nav>

          <div className="min-h-[260px]">
            {tab === "sketch" && <SketchToCode editor={editor} />}
            {tab === "diagram" && <TextToDiagram editor={editor} />}
            {tab === "summary" && <BoardSummary editor={editor} />}
          </div>
        </aside>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg py-1.5 font-[family-name:var(--font-hand)] text-sm transition-colors ${
        active ? "bg-paper shadow-sm" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────────── sketch → code ───────────────── */

function SketchToCode({ editor }: { editor: Editor }) {
  const [framework, setFramework] = useState<"react" | "html">("react");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setCode(null);
    try {
      const ids = editor.getSelectedShapeIds();
      const targetIds: TLShapeId[] = ids.length
        ? ids
        : Array.from(editor.getCurrentPageShapeIds());
      if (targetIds.length === 0) {
        throw new Error("draw or select something first ✏️");
      }
      const dataUrl = await exportPng(editor, targetIds);
      const res = await fetch("/api/sketch-to-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl, framework }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { code: string };
      setCode(data.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
        Select shapes (or use the whole page) and turn your sketch into working{" "}
        {framework === "react" ? "React" : "HTML"}.
      </p>

      <div className="flex gap-2">
        <SegButton
          active={framework === "react"}
          onClick={() => setFramework("react")}
        >
          React + Tailwind
        </SegButton>
        <SegButton
          active={framework === "html"}
          onClick={() => setFramework("html")}
        >
          HTML + CSS
        </SegButton>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="wobble-border bg-coral px-4 py-3 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
      >
        {loading ? "thinking..." : "✦ generate code"}
      </button>

      {error && <ErrorBox>{error}</ErrorBox>}
      {code && <CodeBox code={code} />}
    </div>
  );
}

/* ───────────────── text → diagram ───────────────── */

function TextToDiagram({ editor }: { editor: Editor }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/text-to-diagram", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { shapes } = (await res.json()) as { shapes: AiShape[] };
      drawShapes(editor, shapes);
      setPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
        Describe a diagram and AI draws it on your board.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder="e.g. a microservices architecture with API gateway, auth service, and a redis cache"
        className="wobble-border resize-none bg-cream p-3 font-[family-name:var(--font-hand)] text-base focus:outline-none"
      />
      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="wobble-border bg-sky px-4 py-3 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
      >
        {loading ? "drawing..." : "✦ draw it"}
      </button>
      <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
        Tip: shapes appear at the center of your viewport.
      </p>
      {error && <ErrorBox>{error}</ErrorBox>}
    </div>
  );
}

/* ───────────────── board summary ───────────────── */

function BoardSummary({ editor }: { editor: Editor }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setNotes(null);
    try {
      const ids = Array.from(editor.getCurrentPageShapeIds());
      if (ids.length === 0) throw new Error("the board is empty ✏️");
      const dataUrl = await exportPng(editor, ids);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { notes: string };
      setNotes(data.notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
        Turn everything on your board into structured meeting notes.
      </p>
      <button
        onClick={generate}
        disabled={loading}
        className="wobble-border bg-grape px-4 py-3 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
      >
        {loading ? "reading the board..." : "✦ summarize board"}
      </button>
      {error && <ErrorBox>{error}</ErrorBox>}
      {notes && (
        <div className="wobble-border max-h-[260px] overflow-auto bg-cream p-3 font-[family-name:var(--font-hand)] text-sm leading-snug whitespace-pre-wrap">
          {notes}
        </div>
      )}
    </div>
  );
}

/* ───────────────── shared bits ───────────────── */

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border-2 border-ink py-1 font-[family-name:var(--font-hand)] text-sm ${
        active ? "bg-sun" : "bg-paper hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-coral bg-coral/10 p-2 font-[family-name:var(--font-hand)] text-sm text-coral">
      {children}
    </div>
  );
}

function CodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className="relative">
      <pre className="max-h-[280px] overflow-auto rounded-lg border-2 border-ink bg-ink p-3 font-mono text-xs text-paper">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-paper/30 bg-ink/80 px-2 py-0.5 font-[family-name:var(--font-hand)] text-xs text-paper hover:bg-ink"
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

/* ───────────────── helpers ───────────────── */

async function exportPng(editor: Editor, ids: TLShapeId[]): Promise<string> {
  const { blob } = await editor.toImage(ids, {
    format: "png",
    background: true,
    padding: 32,
    scale: 1,
  });
  return blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type AiShape =
  | {
      kind: "box";
      x: number;
      y: number;
      w: number;
      h: number;
      label?: string;
      color?: TldrawColor;
      shape?: "rectangle" | "ellipse" | "diamond" | "cloud";
    }
  | {
      kind: "text";
      x: number;
      y: number;
      text: string;
    }
  | {
      kind: "arrow";
      from: { x: number; y: number };
      to: { x: number; y: number };
      label?: string;
    };

type TldrawColor =
  | "black"
  | "blue"
  | "green"
  | "grey"
  | "light-blue"
  | "light-green"
  | "light-red"
  | "light-violet"
  | "orange"
  | "red"
  | "violet"
  | "yellow";

const VALID_COLORS: ReadonlySet<TldrawColor> = new Set([
  "black",
  "blue",
  "green",
  "grey",
  "light-blue",
  "light-green",
  "light-red",
  "light-violet",
  "orange",
  "red",
  "violet",
  "yellow",
]);

function safeColor(c?: string): TldrawColor {
  return c && VALID_COLORS.has(c as TldrawColor) ? (c as TldrawColor) : "black";
}

function drawShapes(editor: Editor, shapes: AiShape[]) {
  const center = editor.getViewportPageBounds().center;
  const xs = shapes.flatMap((s) =>
    s.kind === "arrow" ? [s.from.x, s.to.x] : [s.x],
  );
  const ys = shapes.flatMap((s) =>
    s.kind === "arrow" ? [s.from.y, s.to.y] : [s.y],
  );
  const minX = Math.min(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxX = Math.max(...xs, 0);
  const maxY = Math.max(...ys, 0);
  const dx = center.x - (minX + maxX) / 2;
  const dy = center.y - (minY + maxY) / 2;

  const created = shapes.map((s) => {
    if (s.kind === "box") {
      return {
        id: createShapeId(),
        type: "geo" as const,
        x: s.x + dx,
        y: s.y + dy,
        props: {
          geo: s.shape ?? "rectangle",
          w: Math.max(40, s.w),
          h: Math.max(40, s.h),
          color: safeColor(s.color),
          richText: toRichText(s.label ?? ""),
        },
      };
    }
    if (s.kind === "text") {
      return {
        id: createShapeId(),
        type: "text" as const,
        x: s.x + dx,
        y: s.y + dy,
        props: { richText: toRichText(s.text) },
      };
    }
    return {
      id: createShapeId(),
      type: "arrow" as const,
      x: 0,
      y: 0,
      props: {
        start: { x: s.from.x + dx, y: s.from.y + dy },
        end: { x: s.to.x + dx, y: s.to.y + dy },
        richText: toRichText(s.label ?? ""),
      },
    };
  });

  editor.createShapes(created);
  editor.setSelectedShapes(created.map((s) => s.id));
  editor.zoomToSelection({ animation: { duration: 400 } });
}
