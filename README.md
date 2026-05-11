# brainboard

> A whiteboard with a brain.
> Real-time multiplayer · infinite canvas · AI superpowers.

Sketch with friends in real time, then ask Claude to:

- ✏️ **Sketch → Code** — turn a hand-drawn UI into production React + Tailwind (or HTML).
- 📐 **Text → Diagram** — type *"a microservices architecture with redis cache"* and watch shapes appear.
- 📝 **Board → Notes** — summarize the entire board into structured meeting notes.

Built with **Next.js 16**, **tldraw 5**, **`@tldraw/sync`**, and the **Groq API** (free, fast Llama 4 inference).

---

## Quick start

```bash
git clone https://github.com/<you>/brainboard.git
cd brainboard
npm install

cp .env.example .env.local
# add your GROQ_API_KEY to .env.local
# get one FREE at https://console.groq.com/keys (no credit card)

npm run dev
# open http://localhost:3000
```

Click **create a board** on the landing page. Share the URL with anyone — they'll join the same room and see your cursor + edits live, powered by [tldraw sync](https://tldraw.dev/docs/sync).

---

## How the AI features work

Each feature is a thin Next.js route handler around `groq-sdk`. We use **Llama 4 Scout** (vision) for sketch-to-code and board-summarize, and **Llama 3.3 70B** (with JSON mode) for text-to-diagram. Groq's LPU inference is fast enough that prompt caching isn't needed.

| Feature             | Input from canvas                          | Model & job                                                      | Output                                |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------- |
| **Sketch → Code**   | Selected shapes exported as PNG (base64)   | Llama 4 Scout vision → reconstruct sketch as a working component | `tsx` or `html` rendered in a panel   |
| **Text → Diagram**  | A free-text prompt                         | Llama 3.3 70B + JSON mode → `box`/`text`/`arrow` layout          | Real tldraw shapes drawn on your board |
| **Board → Notes**   | Whole-page export as PNG (base64)          | Llama 4 Scout vision → topics, key points, action items          | Markdown shown in the side panel      |

Routes:

- `POST /api/sketch-to-code` — `{ image: dataUrl, framework: "react" | "html" }` → `{ code }`
- `POST /api/text-to-diagram` — `{ prompt: string }` → `{ shapes: AiShape[] }`
- `POST /api/summarize` — `{ image: dataUrl }` → `{ notes: string }`

The `AiShape` schema (and the system prompt enforcing it) lives in [`src/components/AIPanel.tsx`](src/components/AIPanel.tsx) and [`src/app/api/text-to-diagram/route.ts`](src/app/api/text-to-diagram/route.ts).

---

## Architecture

```
brainboard/
├── src/app/
│   ├── page.tsx                  ← landing page (server component)
│   ├── board/[roomId]/
│   │   ├── page.tsx              ← async params (Next 16), passes roomId to client
│   │   └── BoardClient.tsx       ← dynamic-import wrapper for tldraw (client only)
│   └── api/
│       ├── sketch-to-code/route.ts
│       ├── text-to-diagram/route.ts
│       └── summarize/route.ts
├── src/components/
│   ├── CreateBoardButton.tsx     ← landing CTA, generates room id + confetti
│   ├── Whiteboard.tsx            ← <Tldraw> + useSyncDemo, hosts AIPanel
│   ├── RoomBadge.tsx             ← floating "← brainboard" + invite link
│   └── AIPanel.tsx               ← three AI tabs, talks to /api routes
├── src/lib/llm.ts                ← shared Groq client + model constants + fence extraction
└── src/app/globals.css           ← playful tokens, wobble-border, sticky-card
```

### Real-time collaboration

We use **`useSyncDemo`** from `@tldraw/sync`, which connects to tldraw's hosted demo server. Every connected client subscribes to the same `roomId` (namespaced as `brainboard-<id>`) and receives diffs over WebSocket — including presence (cursors, names, colors).

> ⚠️  The demo server is shared, free, and **not durable for production**. For a private deployment, swap `useSyncDemo` for `useSync({ uri: "wss://your-server" })` and run a sync server using [`TLSocketRoom`](https://tldraw.dev/docs/sync) from `@tldraw/sync-core`. A minimal Node + `ws` server is ~80 lines.

---

## Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Turbopack, async route params)
- **Canvas** — [tldraw 5](https://tldraw.dev/) (infinite canvas, all the shape tools)
- **Sync** — [`@tldraw/sync`](https://tldraw.dev/docs/sync) (`useSyncDemo` hook)
- **AI** — [`groq-sdk`](https://github.com/groq/groq-typescript), Llama 4 Scout (vision) + Llama 3.3 70B (JSON), free tier
- **Styling** — Tailwind CSS v4 with custom design tokens, hand-drawn fonts (Caveat + Patrick Hand)
- **Misc** — `nanoid` for room IDs, `canvas-confetti` for the create-board moment

---

## Notes for hackers

- **Next.js 16 gotchas**: `params` and `searchParams` are now `Promise`s — must `await`. `next/dynamic` with `ssr: false` is forbidden in server components, hence the `BoardClient` wrapper.
- **tldraw v5 gotchas**: text shape props use `richText: toRichText("...")`, not bare strings. The `<Tldraw>` `store` and `persistenceKey` props are mutually exclusive.
- **Free, fast inference**: Groq's LPU runs Llama 4 Scout at ~250 tok/s. The free tier is 30 req/min — plenty for personal use.
- **No API key?** The `/board/[roomId]` page works fine without `GROQ_API_KEY` — only the AI panel buttons will return an error.

---

## Roadmap

- [ ] Self-hosted sync server example (Node + `ws` + `TLSocketRoom`)
- [ ] AI shape generator with bindings (arrows that snap to box edges)
- [ ] Voice input for text-to-diagram
- [ ] Auto-organize: ask AI to clean up a messy board
- [ ] Persistent rooms (Cloudflare Durable Objects + R2 for snapshots)

---

## License

MIT.
