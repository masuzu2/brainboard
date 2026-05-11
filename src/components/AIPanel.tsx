"use client";

import { useEffect, useState } from "react";
import { type Editor, type TLShapeId } from "tldraw";
import { drawShapes, type DrawableShape } from "@/lib/drawShapes";
import { useToast } from "./Toast";

type Tab = "sketch" | "diagram" | "summary";

export default function AIPanel({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("sketch");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "1") setTab("sketch");
      else if (e.key === "2") setTab("diagram");
      else if (e.key === "3") setTab("summary");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside className="absolute right-4 top-4 z-30 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[18px] border-2 border-ink bg-paper p-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.9)]">
      <header className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">
          ✦ ai tools
        </h2>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 font-[family-name:var(--font-hand)] text-lg hover:bg-ink/5"
          aria-label="Close panel"
          title="Close (Ctrl+K)"
        >
          ✕
        </button>
      </header>

      <nav className="grid grid-cols-3 gap-1 rounded-xl bg-cream p-1">
        <TabButton active={tab === "sketch"} onClick={() => setTab("sketch")} shortcut="1">
          ✏️ Code
        </TabButton>
        <TabButton active={tab === "diagram"} onClick={() => setTab("diagram")} shortcut="2">
          📐 Diagram
        </TabButton>
        <TabButton active={tab === "summary"} onClick={() => setTab("summary")} shortcut="3">
          📝 Notes
        </TabButton>
      </nav>

      <div className="min-h-[280px]">
        {tab === "sketch" && <SketchToCode editor={editor} />}
        {tab === "diagram" && <TextToDiagram editor={editor} />}
        {tab === "summary" && <BoardSummary editor={editor} />}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  shortcut,
  children,
}: {
  active: boolean;
  onClick: () => void;
  shortcut: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-lg py-1.5 font-[family-name:var(--font-hand)] text-sm transition-colors ${
        active ? "bg-paper shadow-sm" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
      <kbd className="absolute right-1.5 top-1.5 hidden rounded border border-ink/20 bg-paper px-1 font-mono text-[10px] text-ink-soft group-hover:inline-block">
        {shortcut}
      </kbd>
    </button>
  );
}

/* ───────────────── sketch → code ───────────────── */

type Framework = "react" | "html";
type StylePreset = "default" | "modern" | "playful" | "minimal" | "dark";

const STYLE_PRESETS: Record<StylePreset, string> = {
  default: "",
  modern: "Modern, clean, sleek with subtle shadows and rounded corners.",
  playful: "Playful, colorful, with rounded shapes and friendly fonts.",
  minimal: "Minimal — lots of whitespace, monochrome, thin borders.",
  dark: "Dark mode with neon accents and high contrast.",
};

function SketchToCode({ editor }: { editor: Editor }) {
  const toast = useToast();
  const [framework, setFramework] = useState<Framework>("react");
  const [style, setStyle] = useState<StylePreset>("default");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [previousImage, setPreviousImage] = useState<string | null>(null);

  async function runGenerate({ improve }: { improve: boolean }) {
    setLoading(true);
    setStreamingText("");
    setCode(null);
    try {
      let image: string;
      if (improve && previousImage) {
        image = previousImage;
      } else {
        const ids = editor.getSelectedShapeIds();
        const targetIds: TLShapeId[] = ids.length
          ? ids
          : Array.from(editor.getCurrentPageShapeIds());
        if (targetIds.length === 0) {
          throw new Error("draw or select something first ✏️");
        }
        image = await exportPng(editor, targetIds);
        setPreviousImage(image);
      }

      const res = await fetch("/api/sketch-to-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image,
          framework,
          style: STYLE_PRESETS[style] || undefined,
          previousCode: improve ? code ?? undefined : undefined,
        }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamingText(acc);
      }
      const fenceLang = framework === "html" ? "html" : "tsx";
      const extracted = extractFencedBlock(acc, fenceLang) ?? acc.trim();
      setCode(extracted);
      setStreamingText("");
      toast.show("Code generated", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.show(msg, "error");
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
        <SegButton active={framework === "react"} onClick={() => setFramework("react")}>
          React + Tailwind
        </SegButton>
        <SegButton active={framework === "html"} onClick={() => setFramework("html")}>
          HTML + CSS
        </SegButton>
      </div>

      <div>
        <label className="font-[family-name:var(--font-hand)] text-xs uppercase tracking-wider text-ink-soft">
          Style
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as StylePreset)}
          className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-3 py-1.5 font-[family-name:var(--font-hand)] text-base focus:outline-none"
        >
          <option value="default">Auto (let AI decide)</option>
          <option value="modern">Modern & sleek</option>
          <option value="playful">Playful & colorful</option>
          <option value="minimal">Minimal</option>
          <option value="dark">Dark + neon</option>
        </select>
      </div>

      <button
        onClick={() => runGenerate({ improve: false })}
        disabled={loading}
        className="wobble-border bg-coral px-4 py-3 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
      >
        {loading ? "thinking..." : "✦ generate code"}
      </button>

      {code && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => runGenerate({ improve: true })}
            disabled={loading}
            className="wobble-border bg-sky px-3 py-2 font-[family-name:var(--font-hand)] text-base text-paper disabled:opacity-60"
          >
            🔀 try another
          </button>
          <button
            onClick={() => runGenerate({ improve: false })}
            disabled={loading}
            className="wobble-border bg-mint px-3 py-2 font-[family-name:var(--font-hand)] text-base text-paper disabled:opacity-60"
          >
            🔁 redraw
          </button>
        </div>
      )}

      {streamingText && !code && <StreamBox text={streamingText} />}
      {code && <CodeBox code={code} />}
    </div>
  );
}

/* ───────────────── text → diagram ───────────────── */

function TextToDiagram({ editor }: { editor: Editor }) {
  const toast = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/text-to-diagram", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { shapes?: DrawableShape[] };
      if (!data.shapes || data.shapes.length === 0)
        throw new Error("AI returned no shapes");
      drawShapes(editor, data.shapes);
      toast.show(`Drew ${data.shapes.length} shapes`, "success");
      setPrompt("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.show(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "user signup flow with email verification",
    "kubernetes cluster with 3 services and a load balancer",
    "agile sprint cycle: planning, dev, review, retro",
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
        Describe a diagram and AI draws it on your board.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
        }}
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
      <div className="flex flex-wrap gap-1">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setPrompt(s)}
            className="rounded-full border border-ink/30 bg-cream px-2 py-0.5 font-[family-name:var(--font-hand)] text-xs hover:bg-sun"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── board summary ───────────────── */

function BoardSummary({ editor }: { editor: Editor }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
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
      toast.show("Summary ready", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.show(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function copyNotes() {
    if (!notes) return;
    try {
      await navigator.clipboard.writeText(notes);
      toast.show("Notes copied", "success");
    } catch {
      toast.show("Couldn't copy", "error");
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
      {notes && (
        <>
          <div className="wobble-border max-h-[280px] overflow-auto bg-cream p-3 font-[family-name:var(--font-hand)] text-sm leading-snug whitespace-pre-wrap">
            {notes}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyNotes}
              className="wobble-border bg-sun px-3 py-1.5 font-[family-name:var(--font-hand)] text-sm"
            >
              📋 copy markdown
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="wobble-border bg-paper px-3 py-1.5 font-[family-name:var(--font-hand)] text-sm disabled:opacity-60"
            >
              🔁 regenerate
            </button>
          </div>
        </>
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

function StreamBox({ text }: { text: string }) {
  return (
    <pre className="max-h-[280px] overflow-auto rounded-lg border-2 border-ink bg-ink/95 p-3 font-mono text-xs text-paper">
      {text}
      <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-paper align-middle" />
    </pre>
  );
}

function CodeBox({ code }: { code: string }) {
  const toast = useToast();
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.show("Code copied", "success");
    } catch {
      toast.show("Couldn't copy", "error");
    }
  }
  return (
    <div className="relative">
      <pre className="max-h-[300px] overflow-auto rounded-lg border-2 border-ink bg-ink p-3 font-mono text-xs text-paper">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-paper/30 bg-ink/80 px-2 py-0.5 font-[family-name:var(--font-hand)] text-xs text-paper hover:bg-ink"
      >
        copy
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

function extractFencedBlock(text: string, lang: string): string | null {
  const re = new RegExp("```" + lang + "\\s*\\n([\\s\\S]*?)```", "i");
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
